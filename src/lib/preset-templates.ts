/**
 * Eziox Official Preset Templates
 * These are curated templates created by the Eziox team
 * They appear alongside community templates in the Templates page
 */

export interface PresetTemplate {
  id: string
  name: string
  description: string
  category: string
  previewImage?: string
  featured: boolean
  isOfficial: true
  settings: {
    accentColor?: string
    customBackground?: {
      type: 'solid' | 'gradient' | 'image' | 'animated'
      value?: string
      imageUrl?: string
      gradientColors?: string[]
      gradientAngle?: number
      animatedPreset?: string
    }
    layoutSettings?: {
      cardSpacing: number
      cardBorderRadius: number
      cardShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl'
      cardPadding: number
      profileLayout: 'default' | 'centered' | 'minimal' | 'expanded'
      linkStyle: 'default' | 'minimal' | 'bold' | 'glass'
    }
    animatedProfile?: {
      enabled: boolean
      avatarAnimation: 'none' | 'pulse' | 'glow' | 'bounce' | 'rotate' | 'shake'
      bannerAnimation: 'none' | 'parallax' | 'gradient-shift' | 'particles'
      linkHoverEffect: 'none' | 'scale' | 'glow' | 'slide' | 'shake' | 'flip'
      pageTransition: 'none' | 'fade' | 'slide' | 'zoom'
    }
    customCSS?: string
  }
}

export const EZIOX_PRESET_TEMPLATES: PresetTemplate[] = [
  // === MINIMAL CATEGORY ===
  {
    id: 'eziox-minimal-dark',
    name: 'Midnight Minimal',
    description:
      'Clean, dark aesthetic with subtle accents. Perfect for professionals who want a sleek look.',
    category: 'minimal',
    featured: true,
    isOfficial: true,
    settings: {
      accentColor: '#6366f1',
      customBackground: {
        type: 'solid',
        value: '#0a0a0f',
      },
      layoutSettings: {
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
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },
  {
    id: 'eziox-minimal-light',
    name: 'Clean Slate',
    description:
      'Bright and airy design with soft shadows. Ideal for a fresh, modern presence.',
    category: 'minimal',
    featured: false,
    isOfficial: true,
    settings: {
      accentColor: '#3b82f6',
      customBackground: {
        type: 'solid',
        value: '#fafafa',
      },
      layoutSettings: {
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

  // === CREATIVE CATEGORY ===
  {
    id: 'eziox-neon-dreams',
    name: 'Neon Dreams',
    description:
      'Vibrant cyberpunk-inspired design with glowing neon accents and dark backgrounds.',
    category: 'creative',
    featured: true,
    isOfficial: true,
    settings: {
      accentColor: '#ec4899',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#0f0f23', '#1a1a3e'],
        gradientAngle: 135,
      },
      layoutSettings: {
        cardSpacing: 14,
        cardBorderRadius: 20,
        cardShadow: 'lg',
        cardPadding: 18,
        profileLayout: 'default',
        linkStyle: 'glass',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'glow',
        bannerAnimation: 'gradient-shift',
        linkHoverEffect: 'glow',
        pageTransition: 'fade',
      },
      customCSS: `
        .link-card {
          border: 1px solid rgba(236, 72, 153, 0.3);
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.15);
        }
        .link-card:hover {
          box-shadow: 0 0 30px rgba(236, 72, 153, 0.3);
        }
      `,
    },
  },
  {
    id: 'eziox-aurora',
    name: 'Aurora Borealis',
    description:
      'Mesmerizing northern lights gradient with smooth color transitions.',
    category: 'creative',
    featured: true,
    isOfficial: true,
    settings: {
      accentColor: '#22d3ee',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#0c4a6e', '#134e4a', '#1e1b4b'],
        gradientAngle: 160,
      },
      layoutSettings: {
        cardSpacing: 12,
        cardBorderRadius: 16,
        cardShadow: 'md',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'glass',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'pulse',
        bannerAnimation: 'gradient-shift',
        linkHoverEffect: 'scale',
        pageTransition: 'slide',
      },
    },
  },
  {
    id: 'eziox-sunset-vibes',
    name: 'Sunset Vibes',
    description: 'Warm orange and pink gradient inspired by beautiful sunsets.',
    category: 'creative',
    featured: false,
    isOfficial: true,
    settings: {
      accentColor: '#f97316',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#7c2d12', '#be185d', '#4c1d95'],
        gradientAngle: 135,
      },
      layoutSettings: {
        cardSpacing: 14,
        cardBorderRadius: 24,
        cardShadow: 'lg',
        cardPadding: 20,
        profileLayout: 'default',
        linkStyle: 'bold',
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

  // === GAMER CATEGORY ===
  {
    id: 'eziox-gamer-rgb',
    name: 'RGB Gamer',
    description:
      'Bold gaming aesthetic with RGB-inspired colors and sharp edges.',
    category: 'gamer',
    featured: true,
    isOfficial: true,
    settings: {
      accentColor: '#22c55e',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#0a0a0a', '#1a1a2e'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardSpacing: 10,
        cardBorderRadius: 8,
        cardShadow: 'lg',
        cardPadding: 14,
        profileLayout: 'default',
        linkStyle: 'bold',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'pulse',
        bannerAnimation: 'particles',
        linkHoverEffect: 'glow',
        pageTransition: 'slide',
      },
      customCSS: `
        .link-card {
          border: 2px solid rgba(34, 197, 94, 0.5);
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1));
        }
        .link-card:hover {
          border-color: rgba(34, 197, 94, 0.8);
          box-shadow: 0 0 25px rgba(34, 197, 94, 0.4);
        }
      `,
    },
  },
  {
    id: 'eziox-retro-arcade',
    name: 'Retro Arcade',
    description: 'Nostalgic 80s arcade vibes with pixel-perfect aesthetics.',
    category: 'gamer',
    featured: false,
    isOfficial: true,
    settings: {
      accentColor: '#facc15',
      customBackground: {
        type: 'solid',
        value: '#1a1a2e',
      },
      layoutSettings: {
        cardSpacing: 12,
        cardBorderRadius: 4,
        cardShadow: 'none',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'bold',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'bounce',
        bannerAnimation: 'none',
        linkHoverEffect: 'shake',
        pageTransition: 'zoom',
      },
    },
  },

  // === VTUBER CATEGORY ===
  {
    id: 'eziox-kawaii-pink',
    name: 'Kawaii Pink',
    description:
      'Adorable pink aesthetic perfect for VTubers and content creators.',
    category: 'vtuber',
    featured: true,
    isOfficial: true,
    settings: {
      accentColor: '#f472b6',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#fdf2f8', '#fce7f3'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardSpacing: 14,
        cardBorderRadius: 24,
        cardShadow: 'md',
        cardPadding: 18,
        profileLayout: 'default',
        linkStyle: 'default',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'bounce',
        bannerAnimation: 'particles',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
      customCSS: `
        .link-card {
          border: 2px solid rgba(244, 114, 182, 0.3);
        }
        .link-card:hover {
          border-color: rgba(244, 114, 182, 0.6);
        }
      `,
    },
  },
  {
    id: 'eziox-galaxy-idol',
    name: 'Galaxy Idol',
    description:
      'Sparkling cosmic theme with star-studded backgrounds for idol VTubers.',
    category: 'vtuber',
    featured: true,
    isOfficial: true,
    settings: {
      accentColor: '#a855f7',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#1e1b4b', '#312e81', '#4c1d95'],
        gradientAngle: 135,
      },
      layoutSettings: {
        cardSpacing: 12,
        cardBorderRadius: 20,
        cardShadow: 'lg',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'glass',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'glow',
        bannerAnimation: 'particles',
        linkHoverEffect: 'glow',
        pageTransition: 'fade',
      },
    },
  },

  // === DEVELOPER CATEGORY ===
  {
    id: 'eziox-terminal',
    name: 'Terminal',
    description:
      'Hacker-style terminal aesthetic with monospace fonts and green accents.',
    category: 'developer',
    featured: true,
    isOfficial: true,
    settings: {
      accentColor: '#22c55e',
      customBackground: {
        type: 'solid',
        value: '#0d1117',
      },
      layoutSettings: {
        cardSpacing: 8,
        cardBorderRadius: 4,
        cardShadow: 'none',
        cardPadding: 14,
        profileLayout: 'default',
        linkStyle: 'minimal',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'slide',
        pageTransition: 'fade',
      },
      customCSS: `
        * { font-family: 'JetBrains Mono', monospace !important; }
        .link-card {
          border: 1px solid rgba(34, 197, 94, 0.3);
          background: rgba(34, 197, 94, 0.05);
        }
        .link-card:hover {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.6);
        }
      `,
    },
  },
  {
    id: 'eziox-github-dark',
    name: 'GitHub Dark',
    description:
      "Inspired by GitHub's dark theme. Clean and professional for developers.",
    category: 'developer',
    featured: false,
    isOfficial: true,
    settings: {
      accentColor: '#58a6ff',
      customBackground: {
        type: 'solid',
        value: '#0d1117',
      },
      layoutSettings: {
        cardSpacing: 12,
        cardBorderRadius: 8,
        cardShadow: 'sm',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'default',
      },
      animatedProfile: {
        enabled: false,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'scale',
        pageTransition: 'none',
      },
    },
  },

  // === BUSINESS CATEGORY ===
  {
    id: 'eziox-corporate',
    name: 'Corporate Pro',
    description:
      'Professional and trustworthy design for business profiles and entrepreneurs.',
    category: 'business',
    featured: false,
    isOfficial: true,
    settings: {
      accentColor: '#0ea5e9',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#f8fafc', '#e2e8f0'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardSpacing: 14,
        cardBorderRadius: 12,
        cardShadow: 'md',
        cardPadding: 18,
        profileLayout: 'default',
        linkStyle: 'default',
      },
      animatedProfile: {
        enabled: false,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'scale',
        pageTransition: 'none',
      },
    },
  },
  {
    id: 'eziox-executive',
    name: 'Executive Dark',
    description:
      'Elegant dark theme for executives and high-end professionals.',
    category: 'business',
    featured: true,
    isOfficial: true,
    settings: {
      accentColor: '#d4af37',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#18181b', '#27272a'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardSpacing: 16,
        cardBorderRadius: 8,
        cardShadow: 'lg',
        cardPadding: 20,
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

  // === MUSIC CATEGORY ===
  {
    id: 'eziox-spotify-vibes',
    name: 'Spotify Vibes',
    description: 'Music-inspired dark theme with vibrant green accents.',
    category: 'music',
    featured: true,
    isOfficial: true,
    settings: {
      accentColor: '#1db954',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#121212', '#1a1a1a'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardSpacing: 12,
        cardBorderRadius: 8,
        cardShadow: 'md',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'default',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'pulse',
        bannerAnimation: 'none',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },
  {
    id: 'eziox-vinyl-records',
    name: 'Vinyl Records',
    description: 'Retro vinyl aesthetic for music lovers and DJs.',
    category: 'music',
    featured: false,
    isOfficial: true,
    settings: {
      accentColor: '#f97316',
      customBackground: {
        type: 'solid',
        value: '#1c1917',
      },
      layoutSettings: {
        cardSpacing: 14,
        cardBorderRadius: 50,
        cardShadow: 'lg',
        cardPadding: 18,
        profileLayout: 'default',
        linkStyle: 'bold',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'rotate',
        bannerAnimation: 'none',
        linkHoverEffect: 'scale',
        pageTransition: 'slide',
      },
    },
  },

  // === ART CATEGORY ===
  {
    id: 'eziox-watercolor',
    name: 'Watercolor Dreams',
    description:
      'Soft, artistic watercolor-inspired gradients for artists and designers.',
    category: 'art',
    featured: true,
    isOfficial: true,
    settings: {
      accentColor: '#8b5cf6',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#fdf4ff', '#fae8ff', '#f5d0fe'],
        gradientAngle: 135,
      },
      layoutSettings: {
        cardSpacing: 16,
        cardBorderRadius: 24,
        cardShadow: 'md',
        cardPadding: 20,
        profileLayout: 'default',
        linkStyle: 'glass',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'gradient-shift',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },
  {
    id: 'eziox-gallery',
    name: 'Art Gallery',
    description:
      'Clean gallery-style layout to showcase your artwork and portfolio.',
    category: 'art',
    featured: false,
    isOfficial: true,
    settings: {
      accentColor: '#171717',
      customBackground: {
        type: 'solid',
        value: '#fafafa',
      },
      layoutSettings: {
        cardSpacing: 20,
        cardBorderRadius: 0,
        cardShadow: 'lg',
        cardPadding: 24,
        profileLayout: 'default',
        linkStyle: 'minimal',
      },
      animatedProfile: {
        enabled: false,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },

  // === ANIME CATEGORY ===
  {
    id: 'eziox-anime-pastel',
    name: 'Anime Pastel',
    description: 'Soft pastel colors inspired by anime aesthetics.',
    category: 'anime',
    featured: true,
    isOfficial: true,
    settings: {
      accentColor: '#f472b6',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#fce7f3', '#ddd6fe', '#cffafe'],
        gradientAngle: 135,
      },
      layoutSettings: {
        cardSpacing: 14,
        cardBorderRadius: 20,
        cardShadow: 'md',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'default',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'bounce',
        bannerAnimation: 'gradient-shift',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },
  {
    id: 'eziox-dark-anime',
    name: 'Dark Anime',
    description: 'Moody dark anime aesthetic with deep purple and blue tones.',
    category: 'anime',
    featured: false,
    isOfficial: true,
    settings: {
      accentColor: '#a855f7',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#0f0f1a', '#1a1a2e', '#16213e'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardSpacing: 12,
        cardBorderRadius: 16,
        cardShadow: 'lg',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'glass',
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'glow',
        bannerAnimation: 'particles',
        linkHoverEffect: 'glow',
        pageTransition: 'slide',
      },
    },
  },
]

// Helper to get templates by category
export function getPresetTemplatesByCategory(
  category: string,
): PresetTemplate[] {
  if (category === 'all') return EZIOX_PRESET_TEMPLATES
  return EZIOX_PRESET_TEMPLATES.filter((t) => t.category === category)
}

// Helper to get featured preset templates
export function getFeaturedPresetTemplates(): PresetTemplate[] {
  return EZIOX_PRESET_TEMPLATES.filter((t) => t.featured)
}

// Helper to search preset templates
export function searchPresetTemplates(query: string): PresetTemplate[] {
  const lowerQuery = query.toLowerCase()
  return EZIOX_PRESET_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery),
  )
}

// Get total stats
export function getPresetTemplateStats() {
  return {
    total: EZIOX_PRESET_TEMPLATES.length,
    featured: EZIOX_PRESET_TEMPLATES.filter((t) => t.featured).length,
  }
}
