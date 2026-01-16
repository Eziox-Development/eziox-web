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

export interface ThemeEffects {
  glowIntensity: 'none' | 'subtle' | 'medium' | 'strong'
  borderRadius: 'sharp' | 'rounded' | 'pill'
  cardStyle: 'flat' | 'glass' | 'neon' | 'gradient'
  animationSpeed: 'slow' | 'normal' | 'fast'
}

export type ThemeCategory = 'general' | 'gamer' | 'vtuber' | 'developer' | 'streamer' | 'artist' | 'minimal'

export interface Theme {
  id: string
  name: string
  category: ThemeCategory
  description: string
  colors: ThemeColors
  typography: ThemeTypography
  effects: ThemeEffects
}

export interface OwnerStats {
  label: string
  value: string
  icon: string
}

export interface OwnerInfo {
  name: string
  email: string
  userId?: string
  role: string
  bio: string
  extendedBio: string
  avatar: string
  banner?: string
  location?: string
  availability: boolean
  availabilityText?: string
  badges: string[]
  stats: OwnerStats[]
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
    title: 'Eziox',
    description:
      'A modern bio link platform for content creators and professionals showcasing work, thoughts, and expertise.',
    url: 'https://eziox.link',
    language: 'en',
    copyright: `© ${new Date().getFullYear()} All rights reserved.`,
    icon: '/icon.png',
  },

  owner: {
    name: 'Saito',
    email: import.meta.env.VITE_OWNER_EMAIL || '',
    userId: import.meta.env.VITE_OWNER_USER_ID || '',
    role: 'Software Developer · Fachinformatiker AE',
    bio: `I'm a software developer in training (Fachinformatiker für Anwendungsentwicklung) with a strong focus on modern web technologies, backend systems, and clean architecture. I enjoy building things that are not only functional, but also understandable and maintainable.`,
    extendedBio: `I started programming at a young age and quickly developed a deep interest in how systems work under the hood. Over time, I worked with a wide range of technologies — from Python and Node.js to Java, Docker, and modern frontend frameworks.

During my apprenticeship, I focus heavily on real-world development: APIs, databases, authentication systems, infrastructure, and deployment. I value clean code, clear responsibilities, and solutions that scale beyond "it works on my machine".

Besides development, I enjoy experimenting with hosting setups, automation, and developer tooling. I believe good software is built with intention, structure, and a solid understanding of fundamentals.`,
    avatar: 'https://avatars.githubusercontent.com/u/64774999?v=4',
    banner: '/images/banners/saito-banner.webp',
    location: 'Germany',
    availability: true,
    availabilityText: 'Available for new projects',
    badges: [
      'Software Developer',
      'Apprentice (AE)',
      'Backend & Web',
      'API & Infrastructure',
      'Clean Code',
    ],
    stats: [
      { label: 'Years Coding', value: '5+', icon: 'calendar' },
      { label: 'Projects', value: '20+', icon: 'briefcase' },
      { label: 'Technologies', value: '15+', icon: 'code' },
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
    // === GENERAL ===
    {
      id: 'royal-purple',
      name: 'Royal Purple',
      category: 'general',
      description: 'Elegant purple tones with classic typography',
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
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'subtle', borderRadius: 'rounded', cardStyle: 'glass', animationSpeed: 'normal' },
    },
    {
      id: 'midnight',
      name: 'Midnight Blue',
      category: 'general',
      description: 'Deep blue tones for a professional look',
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
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'subtle', borderRadius: 'rounded', cardStyle: 'flat', animationSpeed: 'normal' },
    },
    {
      id: 'sunset',
      name: 'Sunset Warm',
      category: 'general',
      description: 'Warm orange and amber tones',
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
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap',
      },
      effects: { glowIntensity: 'medium', borderRadius: 'rounded', cardStyle: 'gradient', animationSpeed: 'slow' },
    },

    // === GAMER ===
    {
      id: 'neon-gamer',
      name: 'Neon Gamer',
      category: 'gamer',
      description: 'High contrast neon for gamers',
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
        bodyFont: "'Rajdhani', sans-serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'strong', borderRadius: 'sharp', cardStyle: 'neon', animationSpeed: 'fast' },
    },
    {
      id: 'rgb-gaming',
      name: 'RGB Gaming',
      category: 'gamer',
      description: 'Vibrant RGB-inspired colors',
      colors: {
        background: '#0d0d0d',
        backgroundSecondary: '#1a1a1a',
        foreground: '#ffffff',
        foregroundMuted: '#a0a0a0',
        primary: '#ff0080',
        primaryForeground: '#ffffff',
        accent: '#00ffff',
        accentForeground: '#000000',
        border: '#333333',
        card: '#1a1a1a',
        cardForeground: '#ffffff',
      },
      typography: {
        displayFont: "'Bebas Neue', sans-serif",
        bodyFont: "'Exo 2', sans-serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'strong', borderRadius: 'sharp', cardStyle: 'neon', animationSpeed: 'fast' },
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      category: 'gamer',
      description: 'Futuristic yellow and dark tones',
      colors: {
        background: '#0c0c0c',
        backgroundSecondary: '#1a1a1a',
        foreground: '#fcee0a',
        foregroundMuted: '#b8a900',
        primary: '#fcee0a',
        primaryForeground: '#000000',
        accent: '#00d4ff',
        accentForeground: '#000000',
        border: '#2a2a00',
        card: '#1a1a1a',
        cardForeground: '#fcee0a',
      },
      typography: {
        displayFont: "'Audiowide', sans-serif",
        bodyFont: "'Share Tech Mono', monospace",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Audiowide&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap',
      },
      effects: { glowIntensity: 'strong', borderRadius: 'sharp', cardStyle: 'neon', animationSpeed: 'fast' },
    },

    // === VTUBER ===
    {
      id: 'kawaii-pink',
      name: 'Kawaii Pink',
      category: 'vtuber',
      description: 'Cute pastel pink aesthetic',
      colors: {
        background: '#1a0f14',
        backgroundSecondary: '#2a1520',
        foreground: '#ffe4ec',
        foregroundMuted: '#d4a5b5',
        primary: '#ff6b9d',
        primaryForeground: '#ffffff',
        accent: '#ffb3d0',
        accentForeground: '#1a0f14',
        border: '#3d2030',
        card: '#2a1520',
        cardForeground: '#ffe4ec',
      },
      typography: {
        displayFont: "'Comfortaa', sans-serif",
        bodyFont: "'Quicksand', sans-serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;600;700&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'medium', borderRadius: 'pill', cardStyle: 'glass', animationSpeed: 'normal' },
    },
    {
      id: 'pastel-dream',
      name: 'Pastel Dream',
      category: 'vtuber',
      description: 'Soft pastel colors with dreamy vibes',
      colors: {
        background: '#1a1520',
        backgroundSecondary: '#252030',
        foreground: '#f0e6ff',
        foregroundMuted: '#b8a5d4',
        primary: '#a78bfa',
        primaryForeground: '#ffffff',
        accent: '#f0abfc',
        accentForeground: '#1a1520',
        border: '#3d3050',
        card: '#252030',
        cardForeground: '#f0e6ff',
      },
      typography: {
        displayFont: "'Fredoka', sans-serif",
        bodyFont: "'Nunito', sans-serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'subtle', borderRadius: 'pill', cardStyle: 'glass', animationSpeed: 'slow' },
    },
    {
      id: 'anime-night',
      name: 'Anime Night',
      category: 'vtuber',
      description: 'Dark anime-inspired aesthetic',
      colors: {
        background: '#0f0f1a',
        backgroundSecondary: '#1a1a2e',
        foreground: '#eaeaff',
        foregroundMuted: '#9090b0',
        primary: '#6366f1',
        primaryForeground: '#ffffff',
        accent: '#ec4899',
        accentForeground: '#ffffff',
        border: '#2a2a4a',
        card: '#1a1a2e',
        cardForeground: '#eaeaff',
      },
      typography: {
        displayFont: "'M PLUS Rounded 1c', sans-serif",
        bodyFont: "'Noto Sans JP', sans-serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap',
      },
      effects: { glowIntensity: 'medium', borderRadius: 'rounded', cardStyle: 'glass', animationSpeed: 'normal' },
    },

    // === DEVELOPER ===
    {
      id: 'terminal-green',
      name: 'Terminal',
      category: 'developer',
      description: 'Classic terminal green on black',
      colors: {
        background: '#0d1117',
        backgroundSecondary: '#161b22',
        foreground: '#00ff00',
        foregroundMuted: '#238636',
        primary: '#00ff00',
        primaryForeground: '#000000',
        accent: '#58a6ff',
        accentForeground: '#000000',
        border: '#30363d',
        card: '#161b22',
        cardForeground: '#00ff00',
      },
      typography: {
        displayFont: "'JetBrains Mono', monospace",
        bodyFont: "'Fira Code', monospace",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'medium', borderRadius: 'sharp', cardStyle: 'flat', animationSpeed: 'fast' },
    },
    {
      id: 'github-dark',
      name: 'GitHub Dark',
      category: 'developer',
      description: 'Inspired by GitHub dark mode',
      colors: {
        background: '#0d1117',
        backgroundSecondary: '#161b22',
        foreground: '#c9d1d9',
        foregroundMuted: '#8b949e',
        primary: '#58a6ff',
        primaryForeground: '#ffffff',
        accent: '#a371f7',
        accentForeground: '#ffffff',
        border: '#30363d',
        card: '#161b22',
        cardForeground: '#c9d1d9',
      },
      typography: {
        displayFont: "'Inter', sans-serif",
        bodyFont: "'IBM Plex Sans', sans-serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'none', borderRadius: 'rounded', cardStyle: 'flat', animationSpeed: 'normal' },
    },
    {
      id: 'vscode-dark',
      name: 'VS Code',
      category: 'developer',
      description: 'Visual Studio Code inspired',
      colors: {
        background: '#1e1e1e',
        backgroundSecondary: '#252526',
        foreground: '#d4d4d4',
        foregroundMuted: '#808080',
        primary: '#007acc',
        primaryForeground: '#ffffff',
        accent: '#ce9178',
        accentForeground: '#000000',
        border: '#3c3c3c',
        card: '#252526',
        cardForeground: '#d4d4d4',
      },
      typography: {
        displayFont: "'Cascadia Code', monospace",
        bodyFont: "'Source Code Pro', monospace",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;500;600;700&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'none', borderRadius: 'sharp', cardStyle: 'flat', animationSpeed: 'normal' },
    },

    // === STREAMER ===
    {
      id: 'twitch-purple',
      name: 'Twitch',
      category: 'streamer',
      description: 'Twitch-inspired purple theme',
      colors: {
        background: '#0e0e10',
        backgroundSecondary: '#18181b',
        foreground: '#efeff1',
        foregroundMuted: '#adadb8',
        primary: '#9147ff',
        primaryForeground: '#ffffff',
        accent: '#bf94ff',
        accentForeground: '#000000',
        border: '#2f2f35',
        card: '#18181b',
        cardForeground: '#efeff1',
      },
      typography: {
        displayFont: "'Rethink Sans', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Rethink+Sans:wght@400;500;600;700;800&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'medium', borderRadius: 'rounded', cardStyle: 'glass', animationSpeed: 'normal' },
    },
    {
      id: 'youtube-red',
      name: 'YouTube',
      category: 'streamer',
      description: 'YouTube-inspired red theme',
      colors: {
        background: '#0f0f0f',
        backgroundSecondary: '#1a1a1a',
        foreground: '#f1f1f1',
        foregroundMuted: '#aaaaaa',
        primary: '#ff0000',
        primaryForeground: '#ffffff',
        accent: '#ff4e45',
        accentForeground: '#ffffff',
        border: '#303030',
        card: '#1a1a1a',
        cardForeground: '#f1f1f1',
      },
      typography: {
        displayFont: "'Roboto', sans-serif",
        bodyFont: "'Roboto', sans-serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
      },
      effects: { glowIntensity: 'subtle', borderRadius: 'rounded', cardStyle: 'flat', animationSpeed: 'normal' },
    },
    {
      id: 'kick-green',
      name: 'Kick',
      category: 'streamer',
      description: 'Kick-inspired green theme',
      colors: {
        background: '#0b0e0f',
        backgroundSecondary: '#141a1c',
        foreground: '#e8f5e9',
        foregroundMuted: '#81c784',
        primary: '#53fc18',
        primaryForeground: '#000000',
        accent: '#00e676',
        accentForeground: '#000000',
        border: '#1e3320',
        card: '#141a1c',
        cardForeground: '#e8f5e9',
      },
      typography: {
        displayFont: "'Montserrat', sans-serif",
        bodyFont: "'Open Sans', sans-serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'strong', borderRadius: 'rounded', cardStyle: 'neon', animationSpeed: 'fast' },
    },

    // === ARTIST ===
    {
      id: 'canvas-cream',
      name: 'Canvas',
      category: 'artist',
      description: 'Warm cream tones like an art canvas',
      colors: {
        background: '#1a1815',
        backgroundSecondary: '#252220',
        foreground: '#f5f0e8',
        foregroundMuted: '#b8a89a',
        primary: '#d4a574',
        primaryForeground: '#1a1815',
        accent: '#e8c9a8',
        accentForeground: '#1a1815',
        border: '#3d3530',
        card: '#252220',
        cardForeground: '#f5f0e8',
      },
      typography: {
        displayFont: "'Cormorant Garamond', serif",
        bodyFont: "'EB Garamond', serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'none', borderRadius: 'rounded', cardStyle: 'flat', animationSpeed: 'slow' },
    },
    {
      id: 'watercolor',
      name: 'Watercolor',
      category: 'artist',
      description: 'Soft watercolor-inspired palette',
      colors: {
        background: '#151820',
        backgroundSecondary: '#1e2230',
        foreground: '#e8f0f8',
        foregroundMuted: '#98a8c0',
        primary: '#7dd3fc',
        primaryForeground: '#000000',
        accent: '#fda4af',
        accentForeground: '#000000',
        border: '#2a3545',
        card: '#1e2230',
        cardForeground: '#e8f0f8',
      },
      typography: {
        displayFont: "'Caveat', cursive",
        bodyFont: "'Karla', sans-serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'subtle', borderRadius: 'pill', cardStyle: 'glass', animationSpeed: 'slow' },
    },
    {
      id: 'gallery-dark',
      name: 'Gallery',
      category: 'artist',
      description: 'Museum gallery aesthetic',
      colors: {
        background: '#121212',
        backgroundSecondary: '#1e1e1e',
        foreground: '#fafafa',
        foregroundMuted: '#a0a0a0',
        primary: '#ffffff',
        primaryForeground: '#000000',
        accent: '#e0e0e0',
        accentForeground: '#000000',
        border: '#2a2a2a',
        card: '#1e1e1e',
        cardForeground: '#fafafa',
      },
      typography: {
        displayFont: "'Bodoni Moda', serif",
        bodyFont: "'Crimson Text', serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:wght@400;500;600;700&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap',
      },
      effects: { glowIntensity: 'none', borderRadius: 'sharp', cardStyle: 'flat', animationSpeed: 'slow' },
    },

    // === MINIMAL ===
    {
      id: 'minimal-dark',
      name: 'Minimal Dark',
      category: 'minimal',
      description: 'Clean and simple dark theme',
      colors: {
        background: '#111111',
        backgroundSecondary: '#1a1a1a',
        foreground: '#eeeeee',
        foregroundMuted: '#888888',
        primary: '#ffffff',
        primaryForeground: '#000000',
        accent: '#666666',
        accentForeground: '#ffffff',
        border: '#2a2a2a',
        card: '#1a1a1a',
        cardForeground: '#eeeeee',
      },
      typography: {
        displayFont: "'DM Sans', sans-serif",
        bodyFont: "'DM Sans', sans-serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'none', borderRadius: 'rounded', cardStyle: 'flat', animationSpeed: 'normal' },
    },
    {
      id: 'minimal-light',
      name: 'Minimal Light',
      category: 'minimal',
      description: 'Clean and simple light theme',
      colors: {
        background: '#fafafa',
        backgroundSecondary: '#f0f0f0',
        foreground: '#1a1a1a',
        foregroundMuted: '#666666',
        primary: '#000000',
        primaryForeground: '#ffffff',
        accent: '#888888',
        accentForeground: '#ffffff',
        border: '#e0e0e0',
        card: '#ffffff',
        cardForeground: '#1a1a1a',
      },
      typography: {
        displayFont: "'DM Sans', sans-serif",
        bodyFont: "'DM Sans', sans-serif",
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'none', borderRadius: 'rounded', cardStyle: 'flat', animationSpeed: 'normal' },
    },
    {
      id: 'aurora',
      name: 'Aurora',
      category: 'minimal',
      description: 'Calm cyan tones',
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
        displayFontUrl: 'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap',
        bodyFontUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap',
      },
      effects: { glowIntensity: 'subtle', borderRadius: 'rounded', cardStyle: 'glass', animationSpeed: 'normal' },
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
