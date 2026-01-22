export const ANIMATED_PRESETS = [
  // VTuber / Anime
  {
    id: 'sakura',
    name: 'Sakura Petals',
    category: 'vtuber',
    description: 'Falling cherry blossom petals',
  },
  {
    id: 'neon-city',
    name: 'Neon City',
    category: 'vtuber',
    description: 'Cyberpunk city lights',
  },
  {
    id: 'starfield',
    name: 'Starfield',
    category: 'vtuber',
    description: 'Twinkling stars with shooting stars',
  },
  {
    id: 'anime-speed',
    name: 'Speed Lines',
    category: 'vtuber',
    description: 'Anime-style motion lines',
  },
  {
    id: 'holographic',
    name: 'Holographic',
    category: 'vtuber',
    description: 'Iridescent wave effect',
  },
  {
    id: 'sparkles',
    name: 'Sparkles',
    category: 'vtuber',
    description: 'Magical floating sparkles',
  },

  // Gamer
  {
    id: 'matrix',
    name: 'Matrix Rain',
    category: 'gamer',
    description: 'Digital rain effect',
  },
  {
    id: 'cyber-grid',
    name: 'Cyber Grid',
    category: 'gamer',
    description: 'Perspective grid with glow',
  },
  {
    id: 'rgb-wave',
    name: 'RGB Wave',
    category: 'gamer',
    description: 'Flowing RGB colors',
  },
  {
    id: 'particles',
    name: 'Particle Storm',
    category: 'gamer',
    description: 'Dynamic particle system',
  },
  {
    id: 'glitch',
    name: 'Glitch',
    category: 'gamer',
    description: 'Digital glitch effect',
  },
  {
    id: 'hexagons',
    name: 'Hexagon Grid',
    category: 'gamer',
    description: 'Animated hexagonal pattern',
  },

  // Developer
  {
    id: 'code-rain',
    name: 'Code Rain',
    category: 'developer',
    description: 'Falling code characters',
  },
  {
    id: 'binary',
    name: 'Binary Flow',
    category: 'developer',
    description: 'Streaming binary digits',
  },
  {
    id: 'terminal',
    name: 'Terminal Glow',
    category: 'developer',
    description: 'Green terminal aesthetic',
  },
  {
    id: 'circuit',
    name: 'Circuit Board',
    category: 'developer',
    description: 'Animated circuit paths',
  },
  {
    id: 'gradient-mesh',
    name: 'Gradient Mesh',
    category: 'developer',
    description: 'Flowing gradient blobs',
  },
  {
    id: 'dots-grid',
    name: 'Dots Grid',
    category: 'developer',
    description: 'Animated dot pattern',
  },

  // Nature / Chill
  {
    id: 'aurora',
    name: 'Aurora Borealis',
    category: 'nature',
    description: 'Northern lights effect',
  },
  {
    id: 'ocean',
    name: 'Ocean Waves',
    category: 'nature',
    description: 'Gentle wave motion',
  },
  {
    id: 'fireflies',
    name: 'Fireflies',
    category: 'nature',
    description: 'Floating light particles',
  },
  {
    id: 'clouds',
    name: 'Floating Clouds',
    category: 'nature',
    description: 'Drifting cloud layers',
  },
  {
    id: 'rain',
    name: 'Rain',
    category: 'nature',
    description: 'Gentle rainfall',
  },
  {
    id: 'snow',
    name: 'Snowfall',
    category: 'nature',
    description: 'Falling snowflakes',
  },

  // Abstract
  {
    id: 'fluid',
    name: 'Fluid Motion',
    category: 'abstract',
    description: 'Organic flowing shapes',
  },
  {
    id: 'geometric',
    name: 'Geometric',
    category: 'abstract',
    description: 'Rotating geometric shapes',
  },
  {
    id: 'waves',
    name: 'Wave Lines',
    category: 'abstract',
    description: 'Animated sine waves',
  },
  {
    id: 'bokeh',
    name: 'Bokeh',
    category: 'abstract',
    description: 'Blurred light circles',
  },
  {
    id: 'noise',
    name: 'Noise Field',
    category: 'abstract',
    description: 'Perlin noise animation',
  },
  {
    id: 'vortex',
    name: 'Vortex',
    category: 'abstract',
    description: 'Spiral tunnel effect',
  },
] as const

export type AnimatedPresetId = (typeof ANIMATED_PRESETS)[number]['id']
