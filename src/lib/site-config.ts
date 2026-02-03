// Centralized Site Configuration
// All content, metadata, themes, and settings are managed here

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

export type ThemeCategory =
  | 'general'
  | 'gamer'
  | 'vtuber'
  | 'anime'
  | 'developer'
  | 'streamer'
  | 'artist'
  | 'minimal'

export interface Theme {
  id: string
  name: string
  category: ThemeCategory
  description: string
  colors: ThemeColors
  typography: ThemeTypography
  effects: ThemeEffects
  isPremium?: boolean
}

export interface OwnerInfo {
  name: string
  email: string
}

export interface SiteMetadata {
  title: string
  description: string
  url: string
  language: string
  icon?: string
}

export interface SiteConfig {
  metadata: SiteMetadata
  owner: OwnerInfo
  themes: Theme[]
  defaultTheme: string
}

export const siteConfig: SiteConfig = {
  metadata: {
    title: 'Eziox',
    description:
      'The modern bio link platform for creators, streamers, and professionals. Showcase your brand with stunning themes, analytics, and seamless integrations.',
    url: typeof window !== 'undefined' ? (window.location.hostname === 'localhost' ? 'https://localhost:5173' : window.location.origin) : 'https://eziox.link',
    language: 'en',
    icon: '/icon.png',
  },

  owner: {
    name: 'Saito',
    email: import.meta.env.VITE_OWNER_EMAIL || '',
  },

  themes: [
    // === GENERAL ===
    {
      id: 'eziox-default',
      name: 'Eziox',
      category: 'general',
      description: 'The signature Eziox look with vibrant violet accents',
      colors: {
        background: '#030305',
        backgroundSecondary: '#0c0c10',
        foreground: '#fafafa',
        foregroundMuted: '#71717a',
        primary: '#8b5cf6',
        primaryForeground: '#ffffff',
        accent: '#c4b5fd',
        accentForeground: '#030305',
        border: '#1c1c22',
        card: '#0c0c10',
        cardForeground: '#fafafa',
      },
      typography: {
        displayFont: "'Geist', 'Inter', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'subtle',
        borderRadius: 'rounded',
        cardStyle: 'glass',
        animationSpeed: 'normal',
      },
    },
    {
      id: 'obsidian',
      name: 'Obsidian',
      category: 'general',
      description: 'Deep black with purple undertones',
      colors: {
        background: '#09090b',
        backgroundSecondary: '#18181b',
        foreground: '#f4f4f5',
        foregroundMuted: '#a1a1aa',
        primary: '#a855f7',
        primaryForeground: '#ffffff',
        accent: '#d8b4fe',
        accentForeground: '#09090b',
        border: '#27272a',
        card: '#18181b',
        cardForeground: '#f4f4f5',
      },
      typography: {
        displayFont: "'Plus Jakarta Sans', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'subtle',
        borderRadius: 'rounded',
        cardStyle: 'glass',
        animationSpeed: 'normal',
      },
    },
    {
      id: 'midnight',
      name: 'Midnight',
      category: 'general',
      description: 'Deep blue tones for a professional look',
      colors: {
        background: '#020617',
        backgroundSecondary: '#0f172a',
        foreground: '#f1f5f9',
        foregroundMuted: '#94a3b8',
        primary: '#3b82f6',
        primaryForeground: '#ffffff',
        accent: '#60a5fa',
        accentForeground: '#020617',
        border: '#1e293b',
        card: '#0f172a',
        cardForeground: '#f1f5f9',
      },
      typography: {
        displayFont: "'Space Grotesk', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'subtle',
        borderRadius: 'rounded',
        cardStyle: 'glass',
        animationSpeed: 'normal',
      },
    },
    {
      id: 'ember',
      name: 'Ember',
      category: 'general',
      description: 'Warm orange and amber glow',
      colors: {
        background: '#0c0a09',
        backgroundSecondary: '#1c1917',
        foreground: '#fafaf9',
        foregroundMuted: '#a8a29e',
        primary: '#f97316',
        primaryForeground: '#ffffff',
        accent: '#fdba74',
        accentForeground: '#0c0a09',
        border: '#292524',
        card: '#1c1917',
        cardForeground: '#fafaf9',
      },
      typography: {
        displayFont: "'Outfit', sans-serif",
        bodyFont: "'DM Sans', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'medium',
        borderRadius: 'rounded',
        cardStyle: 'gradient',
        animationSpeed: 'normal',
      },
    },

    // === GAMER ===
    {
      id: 'neon-green',
      name: 'Neon Green',
      category: 'gamer',
      description: 'High contrast neon green for gamers',
      colors: {
        background: '#050505',
        backgroundSecondary: '#0a0a0a',
        foreground: '#f0fdf4',
        foregroundMuted: '#86efac',
        primary: '#22c55e',
        primaryForeground: '#000000',
        accent: '#4ade80',
        accentForeground: '#050505',
        border: '#14532d',
        card: '#0a0a0a',
        cardForeground: '#f0fdf4',
      },
      typography: {
        displayFont: "'Orbitron', sans-serif",
        bodyFont: "'Exo 2', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'strong',
        borderRadius: 'sharp',
        cardStyle: 'neon',
        animationSpeed: 'fast',
      },
    },
    {
      id: 'rgb-fusion',
      name: 'RGB Fusion',
      category: 'gamer',
      description: 'Vibrant RGB-inspired magenta and cyan',
      colors: {
        background: '#050508',
        backgroundSecondary: '#0a0a10',
        foreground: '#ffffff',
        foregroundMuted: '#94a3b8',
        primary: '#ec4899',
        primaryForeground: '#ffffff',
        accent: '#06b6d4',
        accentForeground: '#000000',
        border: '#1e1e2e',
        card: '#0a0a10',
        cardForeground: '#ffffff',
      },
      typography: {
        displayFont: "'Chakra Petch', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'strong',
        borderRadius: 'sharp',
        cardStyle: 'neon',
        animationSpeed: 'fast',
      },
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      category: 'gamer',
      description: 'Futuristic yellow neon aesthetic',
      colors: {
        background: '#0a0a0c',
        backgroundSecondary: '#111114',
        foreground: '#fef08a',
        foregroundMuted: '#ca8a04',
        primary: '#eab308',
        primaryForeground: '#000000',
        accent: '#22d3ee',
        accentForeground: '#000000',
        border: '#1c1c1f',
        card: '#111114',
        cardForeground: '#fef08a',
      },
      typography: {
        displayFont: "'Audiowide', sans-serif",
        bodyFont: "'JetBrains Mono', monospace",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Audiowide&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'strong',
        borderRadius: 'sharp',
        cardStyle: 'neon',
        animationSpeed: 'fast',
      },
    },

    // === VTUBER ===
    {
      id: 'kawaii-pink',
      name: 'Kawaii Pink',
      category: 'vtuber',
      description: 'Cute pastel pink aesthetic',
      colors: {
        background: '#0f0a0c',
        backgroundSecondary: '#1a1215',
        foreground: '#fdf2f8',
        foregroundMuted: '#d4a5bd',
        primary: '#ec4899',
        primaryForeground: '#ffffff',
        accent: '#f472b6',
        accentForeground: '#0f0a0c',
        border: '#3d2530',
        card: '#1a1215',
        cardForeground: '#fdf2f8',
      },
      typography: {
        displayFont: "'Quicksand', sans-serif",
        bodyFont: "'Nunito', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'medium',
        borderRadius: 'rounded',
        cardStyle: 'glass',
        animationSpeed: 'normal',
      },
    },
    {
      id: 'pastel-dream',
      name: 'Pastel Dream',
      category: 'vtuber',
      description: 'Soft pastel violet with dreamy vibes',
      colors: {
        background: '#0c0a10',
        backgroundSecondary: '#14101a',
        foreground: '#f5f3ff',
        foregroundMuted: '#a8a0c4',
        primary: '#a78bfa',
        primaryForeground: '#ffffff',
        accent: '#e879f9',
        accentForeground: '#0c0a10',
        border: '#2d2840',
        card: '#14101a',
        cardForeground: '#f5f3ff',
      },
      typography: {
        displayFont: "'Fredoka', sans-serif",
        bodyFont: "'DM Sans', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'subtle',
        borderRadius: 'rounded',
        cardStyle: 'glass',
        animationSpeed: 'slow',
      },
    },
    {
      id: 'anime-night',
      name: 'Anime Night',
      category: 'vtuber',
      description: 'Dark anime-inspired indigo aesthetic',
      colors: {
        background: '#050510',
        backgroundSecondary: '#0a0a18',
        foreground: '#eef2ff',
        foregroundMuted: '#a5b4fc',
        primary: '#6366f1',
        primaryForeground: '#ffffff',
        accent: '#f472b6',
        accentForeground: '#ffffff',
        border: '#1e1b4b',
        card: '#0a0a18',
        cardForeground: '#eef2ff',
      },
      typography: {
        displayFont: "'M PLUS Rounded 1c', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@400;500;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap',
      },
      effects: {
        glowIntensity: 'medium',
        borderRadius: 'rounded',
        cardStyle: 'glass',
        animationSpeed: 'normal',
      },
    },

    // === ANIME ===
    {
      id: 'shonen-fire',
      name: 'Shonen Fire',
      category: 'anime',
      description: 'Intense fiery red and orange battle aesthetic',
      colors: {
        background: '#0c0404',
        backgroundSecondary: '#1a0a0a',
        foreground: '#fef2f2',
        foregroundMuted: '#fca5a5',
        primary: '#ef4444',
        primaryForeground: '#ffffff',
        accent: '#f97316',
        accentForeground: '#0c0404',
        border: '#450a0a',
        card: '#1a0a0a',
        cardForeground: '#fef2f2',
      },
      typography: {
        displayFont: "'Black Ops One', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Black+Ops+One&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap',
      },
      effects: {
        glowIntensity: 'strong',
        borderRadius: 'sharp',
        cardStyle: 'neon',
        animationSpeed: 'fast',
      },
    },
    {
      id: 'slice-of-life',
      name: 'Slice of Life',
      category: 'anime',
      description: 'Calm and cozy warm light theme',
      colors: {
        background: '#fefce8',
        backgroundSecondary: '#fef3c7',
        foreground: '#1c1917',
        foregroundMuted: '#57534e',
        primary: '#65a30d',
        primaryForeground: '#ffffff',
        accent: '#ea580c',
        accentForeground: '#ffffff',
        border: '#d6d3d1',
        card: '#fffbeb',
        cardForeground: '#1c1917',
      },
      typography: {
        displayFont: "'Nunito', sans-serif",
        bodyFont: "'DM Sans', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&display=swap',
      },
      effects: {
        glowIntensity: 'none',
        borderRadius: 'rounded',
        cardStyle: 'flat',
        animationSpeed: 'slow',
      },
    },
    {
      id: 'mecha-chrome',
      name: 'Mecha Chrome',
      category: 'anime',
      description: 'Futuristic mecha with cyan and red accents',
      colors: {
        background: '#020617',
        backgroundSecondary: '#0f172a',
        foreground: '#e2e8f0',
        foregroundMuted: '#64748b',
        primary: '#0ea5e9',
        primaryForeground: '#000000',
        accent: '#f43f5e',
        accentForeground: '#ffffff',
        border: '#1e293b',
        card: '#0f172a',
        cardForeground: '#e2e8f0',
      },
      typography: {
        displayFont: "'Orbitron', sans-serif",
        bodyFont: "'Space Grotesk', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'strong',
        borderRadius: 'sharp',
        cardStyle: 'neon',
        animationSpeed: 'fast',
      },
    },

    // === DEVELOPER ===
    {
      id: 'terminal',
      name: 'Terminal',
      category: 'developer',
      description: 'Classic terminal green on deep black',
      colors: {
        background: '#030303',
        backgroundSecondary: '#0a0a0a',
        foreground: '#4ade80',
        foregroundMuted: '#22c55e',
        primary: '#22c55e',
        primaryForeground: '#000000',
        accent: '#3b82f6',
        accentForeground: '#ffffff',
        border: '#14532d',
        card: '#0a0a0a',
        cardForeground: '#4ade80',
      },
      typography: {
        displayFont: "'JetBrains Mono', monospace",
        bodyFont: "'Fira Code', monospace",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'medium',
        borderRadius: 'sharp',
        cardStyle: 'flat',
        animationSpeed: 'fast',
      },
    },
    {
      id: 'github-dark',
      name: 'GitHub Dark',
      category: 'developer',
      description: 'Official GitHub dark mode colors',
      colors: {
        background: '#0d1117',
        backgroundSecondary: '#161b22',
        foreground: '#e6edf3',
        foregroundMuted: '#7d8590',
        primary: '#2f81f7',
        primaryForeground: '#ffffff',
        accent: '#a371f7',
        accentForeground: '#ffffff',
        border: '#30363d',
        card: '#161b22',
        cardForeground: '#e6edf3',
      },
      typography: {
        displayFont: "'Inter', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'none',
        borderRadius: 'rounded',
        cardStyle: 'flat',
        animationSpeed: 'normal',
      },
    },
    {
      id: 'vscode',
      name: 'VS Code',
      category: 'developer',
      description: 'Visual Studio Code dark theme',
      colors: {
        background: '#1e1e1e',
        backgroundSecondary: '#252526',
        foreground: '#cccccc',
        foregroundMuted: '#6a9955',
        primary: '#0078d4',
        primaryForeground: '#ffffff',
        accent: '#dcdcaa',
        accentForeground: '#1e1e1e',
        border: '#3c3c3c',
        card: '#252526',
        cardForeground: '#cccccc',
      },
      typography: {
        displayFont: "'JetBrains Mono', monospace",
        bodyFont: "'Fira Code', monospace",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'none',
        borderRadius: 'sharp',
        cardStyle: 'flat',
        animationSpeed: 'normal',
      },
    },

    // === STREAMER ===
    {
      id: 'twitch',
      name: 'Twitch',
      category: 'streamer',
      description: 'Official Twitch purple aesthetic',
      colors: {
        background: '#0e0e10',
        backgroundSecondary: '#18181b',
        foreground: '#efeff1',
        foregroundMuted: '#adadb8',
        primary: '#9147ff',
        primaryForeground: '#ffffff',
        accent: '#bf94ff',
        accentForeground: '#0e0e10',
        border: '#26262c',
        card: '#18181b',
        cardForeground: '#efeff1',
      },
      typography: {
        displayFont: "'Inter', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'medium',
        borderRadius: 'rounded',
        cardStyle: 'glass',
        animationSpeed: 'normal',
      },
    },
    {
      id: 'youtube',
      name: 'YouTube',
      category: 'streamer',
      description: 'Official YouTube dark theme',
      colors: {
        background: '#0f0f0f',
        backgroundSecondary: '#212121',
        foreground: '#f1f1f1',
        foregroundMuted: '#aaaaaa',
        primary: '#ff0000',
        primaryForeground: '#ffffff',
        accent: '#3ea6ff',
        accentForeground: '#0f0f0f',
        border: '#303030',
        card: '#212121',
        cardForeground: '#f1f1f1',
      },
      typography: {
        displayFont: "'Roboto', sans-serif",
        bodyFont: "'Roboto', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
      },
      effects: {
        glowIntensity: 'subtle',
        borderRadius: 'rounded',
        cardStyle: 'flat',
        animationSpeed: 'normal',
      },
    },
    {
      id: 'kick',
      name: 'Kick',
      category: 'streamer',
      description: 'Official Kick neon green aesthetic',
      colors: {
        background: '#000000',
        backgroundSecondary: '#0d0d0d',
        foreground: '#ffffff',
        foregroundMuted: '#a3a3a3',
        primary: '#53fc18',
        primaryForeground: '#000000',
        accent: '#00ff85',
        accentForeground: '#000000',
        border: '#1a1a1a',
        card: '#0d0d0d',
        cardForeground: '#ffffff',
      },
      typography: {
        displayFont: "'Inter', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'strong',
        borderRadius: 'rounded',
        cardStyle: 'neon',
        animationSpeed: 'fast',
      },
    },

    // === ARTIST ===
    {
      id: 'canvas',
      name: 'Canvas',
      category: 'artist',
      description: 'Warm sepia tones like an art canvas',
      colors: {
        background: '#0c0a09',
        backgroundSecondary: '#1c1917',
        foreground: '#fafaf9',
        foregroundMuted: '#a8a29e',
        primary: '#d97706',
        primaryForeground: '#ffffff',
        accent: '#fbbf24',
        accentForeground: '#0c0a09',
        border: '#292524',
        card: '#1c1917',
        cardForeground: '#fafaf9',
      },
      typography: {
        displayFont: "'Playfair Display', serif",
        bodyFont: "'Lora', serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'none',
        borderRadius: 'rounded',
        cardStyle: 'flat',
        animationSpeed: 'slow',
      },
    },
    {
      id: 'watercolor',
      name: 'Watercolor',
      category: 'artist',
      description: 'Soft sky blue and rose palette',
      colors: {
        background: '#0c1015',
        backgroundSecondary: '#131a22',
        foreground: '#f0f9ff',
        foregroundMuted: '#94b8d4',
        primary: '#38bdf8',
        primaryForeground: '#0c1015',
        accent: '#fb7185',
        accentForeground: '#0c1015',
        border: '#2a4a6a',
        card: '#131a22',
        cardForeground: '#f0f9ff',
      },
      typography: {
        displayFont: "'Caveat', cursive",
        bodyFont: "'DM Sans', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'subtle',
        borderRadius: 'rounded',
        cardStyle: 'glass',
        animationSpeed: 'slow',
      },
    },
    {
      id: 'gallery',
      name: 'Gallery',
      category: 'artist',
      description: 'Elegant museum gallery aesthetic',
      colors: {
        background: '#0a0a0a',
        backgroundSecondary: '#171717',
        foreground: '#fafafa',
        foregroundMuted: '#737373',
        primary: '#fafafa',
        primaryForeground: '#0a0a0a',
        accent: '#a3a3a3',
        accentForeground: '#0a0a0a',
        border: '#262626',
        card: '#171717',
        cardForeground: '#fafafa',
      },
      typography: {
        displayFont: "'Cormorant Garamond', serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'none',
        borderRadius: 'sharp',
        cardStyle: 'flat',
        animationSpeed: 'slow',
      },
    },

    // === MINIMAL ===
    {
      id: 'minimal-dark',
      name: 'Minimal Dark',
      category: 'minimal',
      description: 'Clean and simple dark theme',
      colors: {
        background: '#09090b',
        backgroundSecondary: '#18181b',
        foreground: '#fafafa',
        foregroundMuted: '#71717a',
        primary: '#fafafa',
        primaryForeground: '#09090b',
        accent: '#52525b',
        accentForeground: '#fafafa',
        border: '#27272a',
        card: '#18181b',
        cardForeground: '#fafafa',
      },
      typography: {
        displayFont: "'Inter', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'none',
        borderRadius: 'rounded',
        cardStyle: 'flat',
        animationSpeed: 'normal',
      },
    },
    {
      id: 'minimal-light',
      name: 'Minimal Light',
      category: 'minimal',
      description: 'Clean and simple light theme',
      colors: {
        background: '#fafafa',
        backgroundSecondary: '#f4f4f5',
        foreground: '#18181b',
        foregroundMuted: '#52525b',
        primary: '#18181b',
        primaryForeground: '#fafafa',
        accent: '#71717a',
        accentForeground: '#fafafa',
        border: '#d4d4d8',
        card: '#ffffff',
        cardForeground: '#18181b',
      },
      typography: {
        displayFont: "'Inter', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'none',
        borderRadius: 'rounded',
        cardStyle: 'flat',
        animationSpeed: 'normal',
      },
    },
    {
      id: 'aurora',
      name: 'Aurora',
      category: 'minimal',
      description: 'Calm cyan tones with subtle glow',
      isPremium: true,
      colors: {
        background: '#030712',
        backgroundSecondary: '#0f172a',
        foreground: '#ecfeff',
        foregroundMuted: '#67e8f9',
        primary: '#06b6d4',
        primaryForeground: '#ffffff',
        accent: '#22d3ee',
        accentForeground: '#030712',
        border: '#164e63',
        card: '#0f172a',
        cardForeground: '#ecfeff',
      },
      typography: {
        displayFont: "'Sora', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'subtle',
        borderRadius: 'rounded',
        cardStyle: 'glass',
        animationSpeed: 'normal',
      },
    },

    // === PREMIUM THEMES ===
    {
      id: 'ocean-depths',
      name: 'Ocean Depths',
      category: 'general',
      description: 'Deep sea blues with bioluminescent glow',
      isPremium: true,
      colors: {
        background: '#020617',
        backgroundSecondary: '#0c1929',
        foreground: '#e0f2fe',
        foregroundMuted: '#38bdf8',
        primary: '#0ea5e9',
        primaryForeground: '#ffffff',
        accent: '#06b6d4',
        accentForeground: '#020617',
        border: '#0c4a6e',
        card: '#0c1929',
        cardForeground: '#e0f2fe',
      },
      typography: {
        displayFont: "'Outfit', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'medium',
        borderRadius: 'rounded',
        cardStyle: 'glass',
        animationSpeed: 'normal',
      },
    },
    {
      id: 'forest-night',
      name: 'Forest Night',
      category: 'general',
      description: 'Mystical emerald greens with moonlit glow',
      isPremium: true,
      colors: {
        background: '#022c22',
        backgroundSecondary: '#064e3b',
        foreground: '#ecfdf5',
        foregroundMuted: '#6ee7b7',
        primary: '#10b981',
        primaryForeground: '#ffffff',
        accent: '#34d399',
        accentForeground: '#022c22',
        border: '#047857',
        card: '#064e3b',
        cardForeground: '#ecfdf5',
      },
      typography: {
        displayFont: "'Sora', sans-serif",
        bodyFont: "'DM Sans', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'subtle',
        borderRadius: 'rounded',
        cardStyle: 'glass',
        animationSpeed: 'slow',
      },
    },
    {
      id: 'neon-tokyo',
      name: 'Neon Tokyo',
      category: 'gamer',
      description: 'Vibrant neon cityscape with rose and violet',
      isPremium: true,
      colors: {
        background: '#030305',
        backgroundSecondary: '#0a0a12',
        foreground: '#faf5ff',
        foregroundMuted: '#c4b5fd',
        primary: '#f43f5e',
        primaryForeground: '#ffffff',
        accent: '#a855f7',
        accentForeground: '#ffffff',
        border: '#1e1b4b',
        card: '#0a0a12',
        cardForeground: '#faf5ff',
      },
      typography: {
        displayFont: "'Chakra Petch', sans-serif",
        bodyFont: "'Space Grotesk', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'strong',
        borderRadius: 'sharp',
        cardStyle: 'neon',
        animationSpeed: 'fast',
      },
    },
    {
      id: 'sakura-bloom',
      name: 'Sakura Bloom',
      category: 'vtuber',
      description: 'Cherry blossom pink with violet accents',
      isPremium: true,
      colors: {
        background: '#0c0608',
        backgroundSecondary: '#1a0f14',
        foreground: '#fdf2f8',
        foregroundMuted: '#c9a0b5',
        primary: '#ec4899',
        primaryForeground: '#ffffff',
        accent: '#c084fc',
        accentForeground: '#ffffff',
        border: '#4a2035',
        card: '#1a0f14',
        cardForeground: '#fdf2f8',
      },
      typography: {
        displayFont: "'Quicksand', sans-serif",
        bodyFont: "'Nunito', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'medium',
        borderRadius: 'rounded',
        cardStyle: 'glass',
        animationSpeed: 'slow',
      },
    },
    {
      id: 'monochrome-pro',
      name: 'Monochrome Pro',
      category: 'minimal',
      description: 'Sophisticated pure grayscale aesthetic',
      isPremium: true,
      colors: {
        background: '#030303',
        backgroundSecondary: '#0a0a0a',
        foreground: '#fafafa',
        foregroundMuted: '#737373',
        primary: '#e5e5e5',
        primaryForeground: '#0a0a0a',
        accent: '#525252',
        accentForeground: '#fafafa',
        border: '#171717',
        card: '#0a0a0a',
        cardForeground: '#fafafa',
      },
      typography: {
        displayFont: "'Manrope', sans-serif",
        bodyFont: "'Inter', sans-serif",
        displayFontUrl:
          'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap',
        bodyFontUrl:
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      },
      effects: {
        glowIntensity: 'none',
        borderRadius: 'rounded',
        cardStyle: 'flat',
        animationSpeed: 'normal',
      },
    },
  ],

  defaultTheme: 'eziox-default',
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
