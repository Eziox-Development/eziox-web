/**
 * Eziox Official Preset Templates
 * Completely redesigned template system with background images
 *
 * 100% compatible with $username profile schema
 * All settings map directly to profile fields
 *
 * Copyright © 2026 Eziox Development. All rights reserved.
 * Licensed under PolyForm Noncommercial 1.0.0
 */

import type {
  CustomBackground,
  LayoutSettings,
  AnimatedProfileSettings,
} from '@/server/db/schema'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type TemplateCategory =
  | 'minimal'
  | 'creative'
  | 'gamer'
  | 'vtuber'
  | 'developer'
  | 'music'
  | 'business'
  | 'art'
  | 'anime'
  | 'other'

export interface PresetTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  tags: string[]
  previewImage?: string
  featured: boolean
  isOfficial: true
  popularity: number
  settings: {
    accentColor?: string
    themeId?: string
    customBackground?: CustomBackground
    layoutSettings?: LayoutSettings
    animatedProfile?: AnimatedProfileSettings
    customCSS?: string
  }
}

// ============================================================================
// BACKGROUND IMAGE URLS (Unsplash/Pexels free images)
// ============================================================================

const BACKGROUNDS = {
  // Minimal - Clean, abstract backgrounds
  minimal: {
    dark: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1920&q=80',
    light: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1920&q=80',
    abstract: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80',
  },
  // Creative - Artistic, colorful backgrounds
  creative: {
    aurora: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80',
    neon: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=1920&q=80',
    gradient: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1920&q=80',
  },
  // Gamer - Gaming setups, RGB, tech
  gamer: {
    rgb: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920&q=80',
    setup: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1920&q=80',
    controller: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=1920&q=80',
  },
  // VTuber - Anime-style, kawaii, virtual
  vtuber: {
    kawaii: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=80',
    cyber: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1920&q=80',
    sakura: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80',
  },
  // Developer - Code, tech, workspace
  developer: {
    code: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&q=80',
    terminal: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1920&q=80',
    workspace: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1920&q=80',
  },
  // Music - Instruments, concerts, audio
  music: {
    vinyl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1920&q=80',
    concert: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&q=80',
    studio: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1920&q=80',
  },
  // Business - Professional, corporate
  business: {
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
    skyline: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80',
    minimal: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=1920&q=80',
  },
  // Art - Artistic, creative
  art: {
    gallery: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80',
    paint: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1920&q=80',
    abstract: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1920&q=80',
  },
  // Anime - Japanese animation style
  anime: {
    sakura: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80',
    tokyo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80',
    night: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1920&q=80',
  },
}

// ============================================================================
// PRESET TEMPLATES
// ============================================================================

export const EZIOX_PRESET_TEMPLATES: PresetTemplate[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MINIMAL - Clean, professional designs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'minimal-obsidian',
    name: 'Obsidian',
    description: 'Ultra-clean dark theme with subtle purple accents',
    category: 'minimal',
    tags: ['dark', 'clean', 'professional', 'modern'],
    featured: true,
    isOfficial: true,
    popularity: 95,
    settings: {
      accentColor: '#8b5cf6',
      customBackground: {
        type: 'solid',
        value: '#09090b',
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 12,
        cardBorderRadius: 12,
        cardShadow: 'sm',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'minimal',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'lift',
        pageTransition: 'fade',
      },
    },
  },
  {
    id: 'minimal-abstract',
    name: 'Abstract Dark',
    description: 'Elegant dark theme with abstract background',
    category: 'minimal',
    tags: ['dark', 'abstract', 'elegant', 'image'],
    featured: true,
    isOfficial: true,
    popularity: 92,
    settings: {
      accentColor: '#6366f1',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.minimal.abstract,
        imageOpacity: 0.3,
        imageBlur: 2,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 14,
        cardBorderRadius: 16,
        cardShadow: 'lg',
        cardPadding: 18,
        profileLayout: 'centered',
        linkStyle: 'glass',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'glow',
        pageTransition: 'fade',
      },
    },
  },
  {
    id: 'minimal-snow',
    name: 'Snow',
    description: 'Bright, airy design with soft shadows',
    category: 'minimal',
    tags: ['light', 'clean', 'fresh', 'bright'],
    featured: false,
    isOfficial: true,
    popularity: 82,
    settings: {
      accentColor: '#3b82f6',
      customBackground: {
        type: 'solid',
        value: '#fafafa',
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 14,
        cardBorderRadius: 16,
        cardShadow: 'md',
        cardPadding: 18,
        profileLayout: 'default',
        linkStyle: 'default',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATIVE - Artistic and expressive designs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'creative-aurora',
    name: 'Aurora Borealis',
    description: 'Mesmerizing northern lights background',
    category: 'creative',
    tags: ['aurora', 'colorful', 'animated', 'nature'],
    featured: true,
    isOfficial: true,
    popularity: 94,
    settings: {
      accentColor: '#06b6d4',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.creative.aurora,
        imageOpacity: 0.6,
        imageBlur: 0,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 14,
        cardBorderRadius: 20,
        cardShadow: 'glow',
        cardPadding: 18,
        profileLayout: 'centered',
        linkStyle: 'glass',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'glow',
        bannerAnimation: 'aurora',
        linkHoverEffect: 'glow',
        pageTransition: 'fade',
        glowColor: '#06b6d4',
      },
    },
  },
  {
    id: 'creative-neon-city',
    name: 'Neon City',
    description: 'Cyberpunk-inspired neon aesthetic',
    category: 'creative',
    tags: ['neon', 'cyberpunk', 'city', 'futuristic'],
    featured: true,
    isOfficial: true,
    popularity: 91,
    settings: {
      accentColor: '#ec4899',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.creative.neon,
        imageOpacity: 0.5,
        imageBlur: 1,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 14,
        cardBorderRadius: 8,
        cardShadow: 'glow',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'neon',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'glow',
        bannerAnimation: 'none',
        linkHoverEffect: 'glow',
        pageTransition: 'fade',
        glowColor: '#ec4899',
      },
    },
  },
  {
    id: 'creative-gradient-dream',
    name: 'Gradient Dream',
    description: 'Smooth colorful gradient background',
    category: 'creative',
    tags: ['gradient', 'colorful', 'smooth', 'vibrant'],
    featured: false,
    isOfficial: true,
    popularity: 85,
    settings: {
      accentColor: '#f97316',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.creative.gradient,
        imageOpacity: 0.7,
        imageBlur: 0,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 14,
        cardBorderRadius: 18,
        cardShadow: 'lg',
        cardPadding: 18,
        profileLayout: 'default',
        linkStyle: 'gradient',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'pulse',
        bannerAnimation: 'gradient-shift',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GAMER - Gaming-focused designs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'gamer-rgb-setup',
    name: 'RGB Setup',
    description: 'Epic gaming setup with RGB lighting',
    category: 'gamer',
    tags: ['rgb', 'gaming', 'setup', 'colorful'],
    featured: true,
    isOfficial: true,
    popularity: 93,
    settings: {
      accentColor: '#22c55e',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.gamer.rgb,
        imageOpacity: 0.5,
        imageBlur: 2,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 12,
        cardBorderRadius: 8,
        cardShadow: 'glow',
        cardPadding: 14,
        profileLayout: 'default',
        linkStyle: 'neon',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'pulse',
        bannerAnimation: 'gradient-shift',
        linkHoverEffect: 'glow',
        pageTransition: 'fade',
        glowColor: '#22c55e',
      },
    },
  },
  {
    id: 'gamer-battlestation',
    name: 'Battlestation',
    description: 'Pro gaming setup aesthetic',
    category: 'gamer',
    tags: ['gaming', 'setup', 'pro', 'dark'],
    featured: false,
    isOfficial: true,
    popularity: 87,
    settings: {
      accentColor: '#ef4444',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.gamer.setup,
        imageOpacity: 0.4,
        imageBlur: 3,
      },
      layoutSettings: {
        cardLayout: 'grid',
        cardSpacing: 10,
        cardBorderRadius: 8,
        cardShadow: 'lg',
        cardPadding: 14,
        profileLayout: 'default',
        linkStyle: 'outline',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },
  {
    id: 'gamer-controller',
    name: 'Controller',
    description: 'Console gaming vibes',
    category: 'gamer',
    tags: ['console', 'controller', 'gaming', 'chill'],
    featured: false,
    isOfficial: true,
    popularity: 78,
    settings: {
      accentColor: '#3b82f6',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.gamer.controller,
        imageOpacity: 0.4,
        imageBlur: 2,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 12,
        cardBorderRadius: 12,
        cardShadow: 'md',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'default',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'bounce',
        bannerAnimation: 'none',
        linkHoverEffect: 'lift',
        pageTransition: 'fade',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VTUBER - Virtual content creator designs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'vtuber-kawaii',
    name: 'Kawaii Dream',
    description: 'Cute and colorful VTuber aesthetic',
    category: 'vtuber',
    tags: ['cute', 'pink', 'kawaii', 'pastel'],
    featured: true,
    isOfficial: true,
    popularity: 92,
    settings: {
      accentColor: '#f472b6',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.vtuber.kawaii,
        imageOpacity: 0.5,
        imageBlur: 1,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 16,
        cardBorderRadius: 24,
        cardShadow: 'md',
        cardPadding: 20,
        profileLayout: 'centered',
        linkStyle: 'default',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'float',
        bannerAnimation: 'particles',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
        particleColor: '#f472b6',
      },
    },
  },
  {
    id: 'vtuber-cyber-idol',
    name: 'Cyber Idol',
    description: 'Futuristic virtual idol theme',
    category: 'vtuber',
    tags: ['cyber', 'idol', 'futuristic', 'blue'],
    featured: true,
    isOfficial: true,
    popularity: 89,
    settings: {
      accentColor: '#06b6d4',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.vtuber.cyber,
        imageOpacity: 0.5,
        imageBlur: 1,
      },
      layoutSettings: {
        cardLayout: 'tilt',
        cardSpacing: 14,
        cardBorderRadius: 16,
        cardShadow: 'glow',
        cardPadding: 18,
        cardTiltDegree: 2,
        profileLayout: 'centered',
        linkStyle: 'glass',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'glow',
        bannerAnimation: 'aurora',
        linkHoverEffect: 'glow',
        pageTransition: 'fade',
        glowColor: '#06b6d4',
      },
    },
  },
  {
    id: 'vtuber-sakura',
    name: 'Sakura Stream',
    description: 'Cherry blossom streaming aesthetic',
    category: 'vtuber',
    tags: ['sakura', 'pink', 'japanese', 'spring'],
    featured: false,
    isOfficial: true,
    popularity: 85,
    settings: {
      accentColor: '#f9a8d4',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.vtuber.sakura,
        imageOpacity: 0.6,
        imageBlur: 1,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 14,
        cardBorderRadius: 20,
        cardShadow: 'md',
        cardPadding: 18,
        profileLayout: 'centered',
        linkStyle: 'default',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'float',
        bannerAnimation: 'particles',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
        particleColor: '#f9a8d4',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEVELOPER - Tech and coding focused
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'dev-code-editor',
    name: 'Code Editor',
    description: 'Classic code editor aesthetic',
    category: 'developer',
    tags: ['code', 'editor', 'dark', 'programming'],
    featured: true,
    isOfficial: true,
    popularity: 91,
    settings: {
      accentColor: '#22c55e',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.developer.code,
        imageOpacity: 0.3,
        imageBlur: 3,
      },
      layoutSettings: {
        cardLayout: 'minimal',
        cardSpacing: 8,
        cardBorderRadius: 4,
        cardShadow: 'sm',
        cardPadding: 12,
        profileLayout: 'default',
        linkStyle: 'minimal',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'scale',
        pageTransition: 'none',
      },
    },
  },
  {
    id: 'dev-terminal',
    name: 'Terminal',
    description: 'Hacker-style terminal theme',
    category: 'developer',
    tags: ['terminal', 'hacker', 'green', 'matrix'],
    featured: true,
    isOfficial: true,
    popularity: 88,
    settings: {
      accentColor: '#22c55e',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.developer.terminal,
        imageOpacity: 0.4,
        imageBlur: 2,
      },
      layoutSettings: {
        cardLayout: 'minimal',
        cardSpacing: 6,
        cardBorderRadius: 2,
        cardShadow: 'none',
        cardPadding: 10,
        profileLayout: 'default',
        linkStyle: 'minimal',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'scale',
        pageTransition: 'none',
      },
    },
  },
  {
    id: 'dev-workspace',
    name: 'Dev Workspace',
    description: 'Clean developer workspace',
    category: 'developer',
    tags: ['workspace', 'clean', 'professional', 'setup'],
    featured: false,
    isOfficial: true,
    popularity: 80,
    settings: {
      accentColor: '#3b82f6',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.developer.workspace,
        imageOpacity: 0.3,
        imageBlur: 4,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 12,
        cardBorderRadius: 8,
        cardShadow: 'md',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'default',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'lift',
        pageTransition: 'fade',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MUSIC - Music and audio focused
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'music-concert',
    name: 'Concert Vibes',
    description: 'Live concert atmosphere',
    category: 'music',
    tags: ['concert', 'live', 'energy', 'lights'],
    featured: true,
    isOfficial: true,
    popularity: 90,
    settings: {
      accentColor: '#f97316',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.music.concert,
        imageOpacity: 0.5,
        imageBlur: 2,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 14,
        cardBorderRadius: 16,
        cardShadow: 'lg',
        cardPadding: 18,
        profileLayout: 'centered',
        linkStyle: 'gradient',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'pulse',
        bannerAnimation: 'gradient-shift',
        linkHoverEffect: 'glow',
        pageTransition: 'fade',
      },
    },
  },
  {
    id: 'music-vinyl',
    name: 'Vinyl Records',
    description: 'Classic vinyl aesthetic',
    category: 'music',
    tags: ['vinyl', 'retro', 'classic', 'warm'],
    featured: false,
    isOfficial: true,
    popularity: 84,
    settings: {
      accentColor: '#f97316',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.music.vinyl,
        imageOpacity: 0.5,
        imageBlur: 2,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 14,
        cardBorderRadius: 16,
        cardShadow: 'lg',
        cardPadding: 18,
        profileLayout: 'centered',
        linkStyle: 'default',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'rotate',
        bannerAnimation: 'none',
        linkHoverEffect: 'lift',
        pageTransition: 'fade',
      },
    },
  },
  {
    id: 'music-studio',
    name: 'Studio Session',
    description: 'Professional music studio',
    category: 'music',
    tags: ['studio', 'professional', 'producer', 'audio'],
    featured: false,
    isOfficial: true,
    popularity: 79,
    settings: {
      accentColor: '#8b5cf6',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.music.studio,
        imageOpacity: 0.4,
        imageBlur: 3,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 12,
        cardBorderRadius: 12,
        cardShadow: 'md',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'glass',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS - Professional and corporate
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'business-skyline',
    name: 'City Skyline',
    description: 'Professional city skyline backdrop',
    category: 'business',
    tags: ['city', 'skyline', 'professional', 'corporate'],
    featured: true,
    isOfficial: true,
    popularity: 86,
    settings: {
      accentColor: '#2563eb',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.business.skyline,
        imageOpacity: 0.4,
        imageBlur: 2,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 12,
        cardBorderRadius: 8,
        cardShadow: 'md',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'default',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'lift',
        pageTransition: 'fade',
      },
    },
  },
  {
    id: 'business-minimal',
    name: 'Corporate Clean',
    description: 'Minimalist corporate design',
    category: 'business',
    tags: ['minimal', 'corporate', 'clean', 'professional'],
    featured: false,
    isOfficial: true,
    popularity: 81,
    settings: {
      accentColor: '#0ea5e9',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.business.minimal,
        imageOpacity: 0.3,
        imageBlur: 4,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 14,
        cardBorderRadius: 12,
        cardShadow: 'sm',
        cardPadding: 18,
        profileLayout: 'centered',
        linkStyle: 'outline',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ART - Artistic and creative
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'art-gallery',
    name: 'Art Gallery',
    description: 'Elegant gallery aesthetic',
    category: 'art',
    tags: ['gallery', 'elegant', 'artistic', 'museum'],
    featured: true,
    isOfficial: true,
    popularity: 83,
    settings: {
      accentColor: '#171717',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.art.gallery,
        imageOpacity: 0.4,
        imageBlur: 2,
      },
      layoutSettings: {
        cardLayout: 'grid',
        cardSpacing: 16,
        cardBorderRadius: 0,
        cardShadow: 'sm',
        cardPadding: 20,
        profileLayout: 'minimal',
        linkStyle: 'minimal',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },
  {
    id: 'art-paint',
    name: 'Paint Splash',
    description: 'Colorful paint splash aesthetic',
    category: 'art',
    tags: ['paint', 'colorful', 'creative', 'splash'],
    featured: false,
    isOfficial: true,
    popularity: 77,
    settings: {
      accentColor: '#7c3aed',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.art.paint,
        imageOpacity: 0.5,
        imageBlur: 1,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 16,
        cardBorderRadius: 24,
        cardShadow: 'md',
        cardPadding: 20,
        profileLayout: 'centered',
        linkStyle: 'glass',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'float',
        bannerAnimation: 'none',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANIME - Anime and manga inspired
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'anime-sakura',
    name: 'Sakura Season',
    description: 'Beautiful cherry blossom theme',
    category: 'anime',
    tags: ['sakura', 'pink', 'japanese', 'spring'],
    featured: true,
    isOfficial: true,
    popularity: 91,
    settings: {
      accentColor: '#f9a8d4',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.anime.sakura,
        imageOpacity: 0.6,
        imageBlur: 1,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 14,
        cardBorderRadius: 20,
        cardShadow: 'md',
        cardPadding: 18,
        profileLayout: 'centered',
        linkStyle: 'default',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'float',
        bannerAnimation: 'particles',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
        particleColor: '#f9a8d4',
      },
    },
  },
  {
    id: 'anime-tokyo-night',
    name: 'Tokyo Night',
    description: 'Neon-lit Tokyo streets',
    category: 'anime',
    tags: ['tokyo', 'night', 'neon', 'city'],
    featured: true,
    isOfficial: true,
    popularity: 89,
    settings: {
      accentColor: '#ec4899',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.anime.tokyo,
        imageOpacity: 0.5,
        imageBlur: 1,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 12,
        cardBorderRadius: 12,
        cardShadow: 'glow',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'neon',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'glow',
        bannerAnimation: 'none',
        linkHoverEffect: 'glow',
        pageTransition: 'fade',
        glowColor: '#ec4899',
      },
    },
  },
  {
    id: 'anime-night-sky',
    name: 'Starry Night',
    description: 'Anime-style night sky',
    category: 'anime',
    tags: ['night', 'stars', 'sky', 'peaceful'],
    featured: false,
    isOfficial: true,
    popularity: 82,
    settings: {
      accentColor: '#8b5cf6',
      customBackground: {
        type: 'image',
        value: '',
        imageUrl: BACKGROUNDS.anime.night,
        imageOpacity: 0.6,
        imageBlur: 0,
      },
      layoutSettings: {
        cardLayout: 'tilt',
        cardSpacing: 14,
        cardBorderRadius: 16,
        cardShadow: 'lg',
        cardPadding: 18,
        cardTiltDegree: 2,
        profileLayout: 'centered',
        linkStyle: 'glass',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'glow',
        bannerAnimation: 'aurora',
        linkHoverEffect: 'glow',
        pageTransition: 'fade',
        glowColor: '#8b5cf6',
      },
    },
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getAllPresetTemplates(): PresetTemplate[] {
  return EZIOX_PRESET_TEMPLATES
}

export function getPresetTemplatesByCategory(category: TemplateCategory): PresetTemplate[] {
  return EZIOX_PRESET_TEMPLATES.filter((t) => t.category === category)
}

export function getFeaturedPresetTemplates(): PresetTemplate[] {
  return EZIOX_PRESET_TEMPLATES.filter((t) => t.featured)
}

export function getPresetTemplateById(id: string): PresetTemplate | undefined {
  return EZIOX_PRESET_TEMPLATES.find((t) => t.id === id)
}

export function searchPresetTemplates(query: string): PresetTemplate[] {
  const lowerQuery = query.toLowerCase()
  return EZIOX_PRESET_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  )
}

export function getPresetTemplateStats() {
  const categories = new Map<string, number>()
  let featuredCount = 0

  for (const template of EZIOX_PRESET_TEMPLATES) {
    categories.set(template.category, (categories.get(template.category) || 0) + 1)
    if (template.featured) featuredCount++
  }

  return {
    total: EZIOX_PRESET_TEMPLATES.length,
    featured: featuredCount,
    byCategory: Object.fromEntries(categories),
  }
}

export function getTemplatesByPopularity(): PresetTemplate[] {
  return [...EZIOX_PRESET_TEMPLATES].sort((a, b) => b.popularity - a.popularity)
}
