/**
 * Eziox Official Preset Templates
 * These are curated templates created by the Eziox team
 * They appear alongside community templates in the Templates page
 *
 * Copyright © 2026 Eziox Development. All rights reserved.
 * Licensed under PolyForm Noncommercial 1.0.0
 */

export type CardLayout = 'default' | 'tilt' | 'stack' | 'grid' | 'minimal'
export type LinkStyle =
  | 'default'
  | 'minimal'
  | 'bold'
  | 'glass'
  | 'outline'
  | 'gradient'
  | 'neon'
export type AvatarAnimation =
  | 'none'
  | 'pulse'
  | 'glow'
  | 'bounce'
  | 'rotate'
  | 'shake'
  | 'float'
export type BannerAnimation =
  | 'none'
  | 'parallax'
  | 'gradient-shift'
  | 'particles'
  | 'wave'
  | 'aurora'
export type LinkHoverEffect =
  | 'none'
  | 'scale'
  | 'glow'
  | 'slide'
  | 'shake'
  | 'flip'
  | 'tilt'
  | 'lift'
export type PageTransition = 'none' | 'fade' | 'slide' | 'zoom' | 'blur'

export interface PresetTemplate {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  previewImage?: string
  featured: boolean
  isOfficial: true
  popularity: number
  settings: {
    accentColor: string
    secondaryColor?: string
    textColor?: string
    customBackground: {
      type: 'solid' | 'gradient' | 'image' | 'animated' | 'mesh'
      value?: string
      imageUrl?: string
      gradientColors?: string[]
      gradientAngle?: number
      animatedPreset?: string
    }
    layoutSettings: {
      cardLayout: CardLayout
      cardSpacing: number
      cardBorderRadius: number
      cardShadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'glow'
      cardPadding: number
      cardTiltDegree?: number
      profileLayout: 'default' | 'centered' | 'minimal' | 'expanded' | 'hero'
      linkStyle: LinkStyle
      maxWidth?: number
    }
    animatedProfile: {
      enabled: boolean
      avatarAnimation: AvatarAnimation
      bannerAnimation: BannerAnimation
      linkHoverEffect: LinkHoverEffect
      pageTransition: PageTransition
      particleColor?: string
      glowColor?: string
    }
    customCSS?: string
  }
}

export const EZIOX_PRESET_TEMPLATES: PresetTemplate[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // MINIMAL CATEGORY - Clean, professional designs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'minimal-midnight',
    name: 'Midnight Minimal',
    description:
      'Clean dark aesthetic with subtle indigo accents. Perfect for professionals.',
    category: 'minimal',
    tags: ['dark', 'professional', 'clean', 'modern'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#6366f1',
      textColor: '#e2e8f0',
      customBackground: {
        type: 'solid',
        value: '#0a0a0f',
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 12,
        cardBorderRadius: 12,
        cardShadow: 'sm',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'minimal',
        maxWidth: 480,
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
    id: 'minimal-clean-slate',
    name: 'Clean Slate',
    description: 'Bright and airy design with soft shadows. Fresh and modern.',
    category: 'minimal',
    tags: ['light', 'clean', 'fresh', 'professional'],
    featured: false,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#3b82f6',
      textColor: '#1e293b',
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
        maxWidth: 480,
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
    id: 'minimal-tilt-cards',
    name: 'Tilted Elegance',
    description:
      'Stylish tilted card layout with subtle shadows. Unique and eye-catching.',
    category: 'minimal',
    tags: ['tilt', 'unique', 'stylish', 'modern'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#8b5cf6',
      textColor: '#f1f5f9',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#0f172a', '#1e1b4b'],
        gradientAngle: 135,
      },
      layoutSettings: {
        cardLayout: 'tilt',
        cardSpacing: 16,
        cardBorderRadius: 16,
        cardShadow: 'lg',
        cardPadding: 18,
        cardTiltDegree: 2,
        profileLayout: 'centered',
        linkStyle: 'glass',
        maxWidth: 520,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'float',
        bannerAnimation: 'none',
        linkHoverEffect: 'tilt',
        pageTransition: 'fade',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CREATIVE CATEGORY - Bold, artistic designs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'creative-neon-dreams',
    name: 'Neon Dreams',
    description: 'Vibrant cyberpunk design with glowing neon accents.',
    category: 'creative',
    tags: ['neon', 'cyberpunk', 'vibrant', 'glow'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#ec4899',
      secondaryColor: '#06b6d4',
      textColor: '#f8fafc',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#0f0f23', '#1a1a3e', '#0f0f23'],
        gradientAngle: 135,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 14,
        cardBorderRadius: 20,
        cardShadow: 'glow',
        cardPadding: 18,
        profileLayout: 'default',
        linkStyle: 'neon',
        maxWidth: 500,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'glow',
        bannerAnimation: 'gradient-shift',
        linkHoverEffect: 'glow',
        pageTransition: 'fade',
        glowColor: '#ec4899',
      },
      customCSS: `
        .link-card {
          border: 1px solid rgba(236, 72, 153, 0.4);
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.2), inset 0 0 20px rgba(236, 72, 153, 0.05);
        }
        .link-card:hover {
          box-shadow: 0 0 40px rgba(236, 72, 153, 0.4), inset 0 0 30px rgba(236, 72, 153, 0.1);
          border-color: rgba(236, 72, 153, 0.8);
        }
      `,
    },
  },
  {
    id: 'creative-aurora',
    name: 'Aurora Borealis',
    description: 'Mesmerizing northern lights with smooth color transitions.',
    category: 'creative',
    tags: ['aurora', 'gradient', 'nature', 'animated'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#22d3ee',
      secondaryColor: '#a855f7',
      textColor: '#f0fdfa',
      customBackground: {
        type: 'animated',
        animatedPreset: 'aurora',
        gradientColors: ['#0c4a6e', '#134e4a', '#1e1b4b'],
        gradientAngle: 160,
      },
      layoutSettings: {
        cardLayout: 'tilt',
        cardSpacing: 14,
        cardBorderRadius: 18,
        cardShadow: 'lg',
        cardPadding: 16,
        cardTiltDegree: -1.5,
        profileLayout: 'centered',
        linkStyle: 'glass',
        maxWidth: 500,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'pulse',
        bannerAnimation: 'aurora',
        linkHoverEffect: 'lift',
        pageTransition: 'blur',
      },
    },
  },
  {
    id: 'creative-sunset',
    name: 'Sunset Vibes',
    description: 'Warm orange and pink gradient inspired by beautiful sunsets.',
    category: 'creative',
    tags: ['sunset', 'warm', 'gradient', 'vibrant'],
    featured: false,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#f97316',
      secondaryColor: '#ec4899',
      textColor: '#fef3c7',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#7c2d12', '#be185d', '#4c1d95'],
        gradientAngle: 135,
      },
      layoutSettings: {
        cardLayout: 'stack',
        cardSpacing: 10,
        cardBorderRadius: 24,
        cardShadow: 'lg',
        cardPadding: 20,
        profileLayout: 'hero',
        linkStyle: 'gradient',
        maxWidth: 520,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'float',
        bannerAnimation: 'gradient-shift',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GAMER CATEGORY - Gaming-inspired designs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'gamer-rgb',
    name: 'RGB Gamer',
    description:
      'Bold gaming aesthetic with RGB-inspired colors and sharp edges.',
    category: 'gamer',
    tags: ['gaming', 'rgb', 'bold', 'esports'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#22c55e',
      secondaryColor: '#3b82f6',
      textColor: '#f0fdf4',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#0a0a0a', '#1a1a2e', '#0a0a0a'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 10,
        cardBorderRadius: 8,
        cardShadow: 'glow',
        cardPadding: 14,
        profileLayout: 'default',
        linkStyle: 'bold',
        maxWidth: 480,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'pulse',
        bannerAnimation: 'particles',
        linkHoverEffect: 'glow',
        pageTransition: 'slide',
        particleColor: '#22c55e',
        glowColor: '#22c55e',
      },
      customCSS: `
        .link-card {
          border: 2px solid rgba(34, 197, 94, 0.5);
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1));
        }
        .link-card:hover {
          border-color: rgba(34, 197, 94, 0.9);
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.5), 0 0 60px rgba(59, 130, 246, 0.3);
        }
      `,
    },
  },
  {
    id: 'gamer-retro-arcade',
    name: 'Retro Arcade',
    description: 'Nostalgic 80s arcade vibes with pixel-perfect aesthetics.',
    category: 'gamer',
    tags: ['retro', 'arcade', '80s', 'pixel'],
    featured: false,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#facc15',
      secondaryColor: '#f472b6',
      textColor: '#fef9c3',
      customBackground: {
        type: 'solid',
        value: '#1a1a2e',
      },
      layoutSettings: {
        cardLayout: 'grid',
        cardSpacing: 12,
        cardBorderRadius: 4,
        cardShadow: 'none',
        cardPadding: 16,
        profileLayout: 'centered',
        linkStyle: 'bold',
        maxWidth: 560,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'bounce',
        bannerAnimation: 'none',
        linkHoverEffect: 'shake',
        pageTransition: 'zoom',
      },
      customCSS: `
        .link-card {
          border: 3px solid #facc15;
          font-family: 'Press Start 2P', monospace;
        }
        .link-card:hover {
          background: #facc15;
          color: #1a1a2e;
        }
      `,
    },
  },
  {
    id: 'gamer-esports-pro',
    name: 'Esports Pro',
    description:
      'Professional esports team style with tilted cards and sharp design.',
    category: 'gamer',
    tags: ['esports', 'professional', 'team', 'competitive'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#ef4444',
      secondaryColor: '#f97316',
      textColor: '#fef2f2',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#0c0c0c', '#1c1917', '#0c0c0c'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardLayout: 'tilt',
        cardSpacing: 12,
        cardBorderRadius: 6,
        cardShadow: 'lg',
        cardPadding: 16,
        cardTiltDegree: 3,
        profileLayout: 'hero',
        linkStyle: 'bold',
        maxWidth: 500,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'particles',
        linkHoverEffect: 'tilt',
        pageTransition: 'slide',
        particleColor: '#ef4444',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VTUBER CATEGORY - Anime/VTuber inspired designs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'vtuber-kawaii-pink',
    name: 'Kawaii Pink',
    description:
      'Adorable pink aesthetic perfect for VTubers and content creators.',
    category: 'vtuber',
    tags: ['kawaii', 'pink', 'cute', 'vtuber'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#f472b6',
      secondaryColor: '#c084fc',
      textColor: '#831843',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#fdf2f8', '#fce7f3', '#fbcfe8'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 14,
        cardBorderRadius: 24,
        cardShadow: 'md',
        cardPadding: 18,
        profileLayout: 'centered',
        linkStyle: 'default',
        maxWidth: 480,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'bounce',
        bannerAnimation: 'particles',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
        particleColor: '#f472b6',
      },
      customCSS: `
        .link-card {
          border: 2px solid rgba(244, 114, 182, 0.4);
          background: rgba(255, 255, 255, 0.8);
        }
        .link-card:hover {
          border-color: rgba(244, 114, 182, 0.8);
          transform: scale(1.02) rotate(-1deg);
        }
      `,
    },
  },
  {
    id: 'vtuber-galaxy-idol',
    name: 'Galaxy Idol',
    description:
      'Sparkling cosmic theme with star-studded backgrounds for idol VTubers.',
    category: 'vtuber',
    tags: ['galaxy', 'idol', 'stars', 'cosmic'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#a855f7',
      secondaryColor: '#ec4899',
      textColor: '#f5f3ff',
      customBackground: {
        type: 'animated',
        animatedPreset: 'stars',
        gradientColors: ['#1e1b4b', '#312e81', '#4c1d95'],
        gradientAngle: 135,
      },
      layoutSettings: {
        cardLayout: 'tilt',
        cardSpacing: 14,
        cardBorderRadius: 20,
        cardShadow: 'glow',
        cardPadding: 16,
        cardTiltDegree: -2,
        profileLayout: 'hero',
        linkStyle: 'glass',
        maxWidth: 500,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'glow',
        bannerAnimation: 'particles',
        linkHoverEffect: 'glow',
        pageTransition: 'blur',
        particleColor: '#c084fc',
        glowColor: '#a855f7',
      },
    },
  },
  {
    id: 'vtuber-cozy-stream',
    name: 'Cozy Stream',
    description: 'Warm and inviting design for cozy streaming vibes.',
    category: 'vtuber',
    tags: ['cozy', 'warm', 'stream', 'comfortable'],
    featured: false,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#f59e0b',
      secondaryColor: '#fb923c',
      textColor: '#451a03',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#fef3c7', '#fde68a', '#fcd34d'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardLayout: 'stack',
        cardSpacing: 12,
        cardBorderRadius: 20,
        cardShadow: 'md',
        cardPadding: 18,
        profileLayout: 'centered',
        linkStyle: 'default',
        maxWidth: 480,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'float',
        bannerAnimation: 'none',
        linkHoverEffect: 'lift',
        pageTransition: 'fade',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DEVELOPER CATEGORY - Tech-focused designs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'dev-terminal',
    name: 'Terminal',
    description:
      'Hacker-style terminal aesthetic with monospace fonts and green accents.',
    category: 'developer',
    tags: ['terminal', 'hacker', 'code', 'matrix'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#22c55e',
      textColor: '#22c55e',
      customBackground: {
        type: 'solid',
        value: '#0d1117',
      },
      layoutSettings: {
        cardLayout: 'minimal',
        cardSpacing: 8,
        cardBorderRadius: 4,
        cardShadow: 'none',
        cardPadding: 14,
        profileLayout: 'minimal',
        linkStyle: 'outline',
        maxWidth: 520,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'slide',
        pageTransition: 'fade',
      },
      customCSS: `
        * { font-family: 'JetBrains Mono', 'Fira Code', monospace !important; }
        .link-card {
          border: 1px solid rgba(34, 197, 94, 0.4);
          background: rgba(34, 197, 94, 0.05);
        }
        .link-card:hover {
          background: rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.8);
        }
        .link-card::before {
          content: '> ';
          color: #22c55e;
        }
      `,
    },
  },
  {
    id: 'dev-github-dark',
    name: 'GitHub Dark',
    description:
      "Inspired by GitHub's dark theme. Clean and professional for developers.",
    category: 'developer',
    tags: ['github', 'dark', 'professional', 'code'],
    featured: false,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#58a6ff',
      secondaryColor: '#238636',
      textColor: '#c9d1d9',
      customBackground: {
        type: 'solid',
        value: '#0d1117',
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 12,
        cardBorderRadius: 8,
        cardShadow: 'sm',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'default',
        maxWidth: 480,
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
    id: 'dev-vscode',
    name: 'VS Code',
    description: 'Inspired by Visual Studio Code. Perfect for developers.',
    category: 'developer',
    tags: ['vscode', 'ide', 'code', 'microsoft'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#007acc',
      secondaryColor: '#0098ff',
      textColor: '#cccccc',
      customBackground: {
        type: 'solid',
        value: '#1e1e1e',
      },
      layoutSettings: {
        cardLayout: 'tilt',
        cardSpacing: 10,
        cardBorderRadius: 6,
        cardShadow: 'md',
        cardPadding: 14,
        cardTiltDegree: 1,
        profileLayout: 'default',
        linkStyle: 'minimal',
        maxWidth: 500,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'lift',
        pageTransition: 'fade',
      },
      customCSS: `
        .link-card {
          border-left: 3px solid #007acc;
          background: #252526;
        }
        .link-card:hover {
          background: #2d2d2d;
          border-left-color: #0098ff;
        }
      `,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUSINESS CATEGORY - Professional designs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'business-corporate',
    name: 'Corporate Pro',
    description: 'Professional and trustworthy design for business profiles.',
    category: 'business',
    tags: ['corporate', 'professional', 'business', 'clean'],
    featured: false,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#0ea5e9',
      textColor: '#1e293b',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#f8fafc', '#e2e8f0'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 14,
        cardBorderRadius: 12,
        cardShadow: 'md',
        cardPadding: 18,
        profileLayout: 'default',
        linkStyle: 'default',
        maxWidth: 480,
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
    id: 'business-executive',
    name: 'Executive Dark',
    description:
      'Elegant dark theme for executives and high-end professionals.',
    category: 'business',
    tags: ['executive', 'luxury', 'dark', 'elegant'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#d4af37',
      secondaryColor: '#b8860b',
      textColor: '#fafaf9',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#18181b', '#27272a', '#18181b'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardLayout: 'tilt',
        cardSpacing: 16,
        cardBorderRadius: 8,
        cardShadow: 'lg',
        cardPadding: 20,
        cardTiltDegree: -1,
        profileLayout: 'hero',
        linkStyle: 'default',
        maxWidth: 500,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'none',
        bannerAnimation: 'none',
        linkHoverEffect: 'lift',
        pageTransition: 'fade',
      },
      customCSS: `
        .link-card {
          border: 1px solid rgba(212, 175, 55, 0.3);
        }
        .link-card:hover {
          border-color: rgba(212, 175, 55, 0.6);
          box-shadow: 0 10px 40px rgba(212, 175, 55, 0.15);
        }
      `,
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MUSIC CATEGORY - Music-inspired designs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'music-spotify',
    name: 'Spotify Vibes',
    description: 'Music-inspired dark theme with vibrant green accents.',
    category: 'music',
    tags: ['spotify', 'music', 'streaming', 'green'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#1db954',
      textColor: '#ffffff',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#121212', '#1a1a1a', '#121212'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 12,
        cardBorderRadius: 8,
        cardShadow: 'md',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'default',
        maxWidth: 480,
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
    id: 'music-vinyl',
    name: 'Vinyl Records',
    description: 'Retro vinyl aesthetic for music lovers and DJs.',
    category: 'music',
    tags: ['vinyl', 'retro', 'dj', 'analog'],
    featured: false,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#f97316',
      secondaryColor: '#ea580c',
      textColor: '#fef3c7',
      customBackground: {
        type: 'solid',
        value: '#1c1917',
      },
      layoutSettings: {
        cardLayout: 'stack',
        cardSpacing: 14,
        cardBorderRadius: 50,
        cardShadow: 'lg',
        cardPadding: 18,
        profileLayout: 'centered',
        linkStyle: 'bold',
        maxWidth: 480,
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
  {
    id: 'music-soundwave',
    name: 'Soundwave',
    description: 'Dynamic audio-inspired design with wave animations.',
    category: 'music',
    tags: ['soundwave', 'audio', 'dynamic', 'producer'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#8b5cf6',
      secondaryColor: '#06b6d4',
      textColor: '#e0e7ff',
      customBackground: {
        type: 'animated',
        animatedPreset: 'wave',
        gradientColors: ['#0f172a', '#1e1b4b'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardLayout: 'tilt',
        cardSpacing: 12,
        cardBorderRadius: 16,
        cardShadow: 'glow',
        cardPadding: 16,
        cardTiltDegree: 2,
        profileLayout: 'hero',
        linkStyle: 'glass',
        maxWidth: 500,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'pulse',
        bannerAnimation: 'wave',
        linkHoverEffect: 'glow',
        pageTransition: 'blur',
        glowColor: '#8b5cf6',
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ART CATEGORY - Artistic designs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'art-watercolor',
    name: 'Watercolor Dreams',
    description: 'Soft, artistic watercolor-inspired gradients for artists.',
    category: 'art',
    tags: ['watercolor', 'soft', 'artistic', 'pastel'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#8b5cf6',
      secondaryColor: '#ec4899',
      textColor: '#581c87',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#fdf4ff', '#fae8ff', '#f5d0fe'],
        gradientAngle: 135,
      },
      layoutSettings: {
        cardLayout: 'tilt',
        cardSpacing: 16,
        cardBorderRadius: 24,
        cardShadow: 'md',
        cardPadding: 20,
        cardTiltDegree: -2,
        profileLayout: 'centered',
        linkStyle: 'glass',
        maxWidth: 500,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'float',
        bannerAnimation: 'gradient-shift',
        linkHoverEffect: 'scale',
        pageTransition: 'fade',
      },
    },
  },
  {
    id: 'art-gallery',
    name: 'Art Gallery',
    description: 'Clean gallery-style layout to showcase your artwork.',
    category: 'art',
    tags: ['gallery', 'minimal', 'showcase', 'portfolio'],
    featured: false,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#171717',
      textColor: '#171717',
      customBackground: {
        type: 'solid',
        value: '#fafafa',
      },
      layoutSettings: {
        cardLayout: 'grid',
        cardSpacing: 20,
        cardBorderRadius: 0,
        cardShadow: 'lg',
        cardPadding: 24,
        profileLayout: 'minimal',
        linkStyle: 'minimal',
        maxWidth: 600,
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

  // ═══════════════════════════════════════════════════════════════════════════
  // ANIME CATEGORY - Anime-inspired designs
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'anime-pastel',
    name: 'Anime Pastel',
    description: 'Soft pastel colors inspired by anime aesthetics.',
    category: 'anime',
    tags: ['pastel', 'soft', 'anime', 'cute'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#f472b6',
      secondaryColor: '#a78bfa',
      textColor: '#831843',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#fce7f3', '#ddd6fe', '#cffafe'],
        gradientAngle: 135,
      },
      layoutSettings: {
        cardLayout: 'tilt',
        cardSpacing: 14,
        cardBorderRadius: 20,
        cardShadow: 'md',
        cardPadding: 16,
        cardTiltDegree: 1.5,
        profileLayout: 'centered',
        linkStyle: 'default',
        maxWidth: 480,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'bounce',
        bannerAnimation: 'gradient-shift',
        linkHoverEffect: 'tilt',
        pageTransition: 'fade',
      },
    },
  },
  {
    id: 'anime-dark',
    name: 'Dark Anime',
    description: 'Moody dark anime aesthetic with deep purple and blue tones.',
    category: 'anime',
    tags: ['dark', 'moody', 'anime', 'purple'],
    featured: false,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#a855f7',
      secondaryColor: '#6366f1',
      textColor: '#e9d5ff',
      customBackground: {
        type: 'gradient',
        gradientColors: ['#0f0f1a', '#1a1a2e', '#16213e'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardLayout: 'default',
        cardSpacing: 12,
        cardBorderRadius: 16,
        cardShadow: 'glow',
        cardPadding: 16,
        profileLayout: 'default',
        linkStyle: 'glass',
        maxWidth: 480,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'glow',
        bannerAnimation: 'particles',
        linkHoverEffect: 'glow',
        pageTransition: 'slide',
        particleColor: '#a855f7',
        glowColor: '#a855f7',
      },
    },
  },
  {
    id: 'anime-sakura',
    name: 'Sakura Bloom',
    description: 'Beautiful cherry blossom inspired theme with falling petals.',
    category: 'anime',
    tags: ['sakura', 'cherry', 'blossom', 'japanese'],
    featured: true,
    isOfficial: true,
    popularity: 0,
    settings: {
      accentColor: '#fb7185',
      secondaryColor: '#fda4af',
      textColor: '#881337',
      customBackground: {
        type: 'animated',
        animatedPreset: 'sakura',
        gradientColors: ['#fff1f2', '#ffe4e6', '#fecdd3'],
        gradientAngle: 180,
      },
      layoutSettings: {
        cardLayout: 'tilt',
        cardSpacing: 14,
        cardBorderRadius: 22,
        cardShadow: 'md',
        cardPadding: 18,
        cardTiltDegree: -1.5,
        profileLayout: 'hero',
        linkStyle: 'glass',
        maxWidth: 500,
      },
      animatedProfile: {
        enabled: true,
        avatarAnimation: 'float',
        bannerAnimation: 'particles',
        linkHoverEffect: 'lift',
        pageTransition: 'blur',
        particleColor: '#fb7185',
      },
    },
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get templates by category
 */
export function getPresetTemplatesByCategory(
  category: string,
): PresetTemplate[] {
  if (category === 'all') return EZIOX_PRESET_TEMPLATES
  return EZIOX_PRESET_TEMPLATES.filter((t) => t.category === category)
}

/**
 * Get featured preset templates
 */
export function getFeaturedPresetTemplates(): PresetTemplate[] {
  return EZIOX_PRESET_TEMPLATES.filter((t) => t.featured)
}

/**
 * Search preset templates by query
 */
export function searchPresetTemplates(query: string): PresetTemplate[] {
  const lowerQuery = query.toLowerCase()
  return EZIOX_PRESET_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  )
}

/**
 * Get templates sorted by popularity
 */
export function getPopularPresetTemplates(limit?: number): PresetTemplate[] {
  const sorted = [...EZIOX_PRESET_TEMPLATES].sort(
    (a, b) => b.popularity - a.popularity,
  )
  return limit ? sorted.slice(0, limit) : sorted
}

/**
 * Get templates by layout type
 */
export function getPresetTemplatesByLayout(
  layout: CardLayout,
): PresetTemplate[] {
  return EZIOX_PRESET_TEMPLATES.filter(
    (t) => t.settings.layoutSettings.cardLayout === layout,
  )
}

/**
 * Get total stats
 */
export function getPresetTemplateStats() {
  const templates = EZIOX_PRESET_TEMPLATES
  return {
    total: templates.length,
    featured: templates.filter((t) => t.featured).length,
    totalPopularity: templates.reduce((sum, t) => sum + t.popularity, 0),
    categories: [...new Set(templates.map((t) => t.category))].length,
    withTiltLayout: templates.filter(
      (t) => t.settings.layoutSettings.cardLayout === 'tilt',
    ).length,
  }
}

/**
 * Get template by ID
 */
export function getPresetTemplateById(id: string): PresetTemplate | undefined {
  return EZIOX_PRESET_TEMPLATES.find((t) => t.id === id)
}

/**
 * Generate CSS for template preview
 */
export function generatePreviewCSS(template: PresetTemplate): string {
  const { settings } = template
  const { layoutSettings, animatedProfile, customBackground } = settings

  let bgStyle = ''
  if (customBackground.type === 'solid') {
    bgStyle = `background: ${customBackground.value};`
  } else if (
    customBackground.type === 'gradient' &&
    customBackground.gradientColors
  ) {
    bgStyle = `background: linear-gradient(${customBackground.gradientAngle || 135}deg, ${customBackground.gradientColors.join(', ')});`
  }

  let cardTransform = ''
  if (layoutSettings.cardLayout === 'tilt' && layoutSettings.cardTiltDegree) {
    cardTransform = `transform: rotate(${layoutSettings.cardTiltDegree}deg);`
  }

  return `
    .preview-container {
      ${bgStyle}
      color: ${settings.textColor || '#ffffff'};
      padding: 24px;
      border-radius: 16px;
      min-height: 300px;
    }
    .preview-card {
      background: rgba(255, 255, 255, 0.1);
      border-radius: ${layoutSettings.cardBorderRadius}px;
      padding: ${layoutSettings.cardPadding}px;
      margin-bottom: ${layoutSettings.cardSpacing}px;
      ${cardTransform}
      transition: all 0.3s ease;
    }
    .preview-card:hover {
      ${animatedProfile.linkHoverEffect === 'scale' ? 'transform: scale(1.02);' : ''}
      ${animatedProfile.linkHoverEffect === 'lift' ? 'transform: translateY(-4px);' : ''}
      ${animatedProfile.linkHoverEffect === 'glow' ? `box-shadow: 0 0 20px ${settings.accentColor}40;` : ''}
      ${animatedProfile.linkHoverEffect === 'tilt' ? 'transform: rotate(2deg);' : ''}
    }
    ${settings.customCSS || ''}
  `
}
