import type { LucideIcon } from 'lucide-react'
import type {
  CustomBackground,
  LayoutSettings,
  AnimatedProfileSettings,
  CustomFont,
  IntroGateSettings,
  ProfileMusicSettings,
  NameEffect,
  StatusText,
  CustomCursor,
  ProfileEffects,
} from '@/server/db/schema'

// Re-export schema types for tab components
export type {
  CustomBackground,
  LayoutSettings,
  AnimatedProfileSettings,
  CustomFont,
  IntroGateSettings,
  ProfileMusicSettings,
  NameEffect,
  StatusText,
  CustomCursor,
  ProfileEffects,
}

export type PlaygroundTabType =
  | 'background'
  | 'layout'
  | 'animations'
  | 'fonts'
  | 'css'
  | 'intro-gate'
  | 'music'
  | 'name-effects'
  | 'status-text'
  | 'cursor'
  | 'effects'
  | 'backups'

export interface PlaygroundTab {
  id: PlaygroundTabType
  labelKey: string
  descKey: string
  icon: LucideIcon
  premium?: boolean
}

export const DEFAULT_LAYOUT: LayoutSettings = {
  cardLayout: 'default',
  cardSpacing: 12,
  cardBorderRadius: 16,
  cardShadow: 'md',
  cardPadding: 16,
  profileLayout: 'default',
  linkStyle: 'default',
}

export const DEFAULT_ANIMATED: AnimatedProfileSettings = {
  enabled: false,
  avatarAnimation: 'none',
  bannerAnimation: 'none',
  linkHoverEffect: 'scale',
  pageTransition: 'fade',
}

export const DEFAULT_INTRO_GATE: IntroGateSettings = {
  enabled: false,
  text: '',
  buttonText: 'Enter',
  style: 'blur',
  showAvatar: true,
}

export const DEFAULT_MUSIC: ProfileMusicSettings = {
  enabled: false,
  url: '',
  autoplay: false,
  volume: 0.5,
  loop: true,
}

export const DEFAULT_NAME_EFFECT: NameEffect = {
  style: 'none',
  animation: 'none',
}

export const DEFAULT_STATUS_TEXT: StatusText = {
  enabled: false,
  text: '',
  emoji: '',
  typewriter: false,
  typewriterSpeed: 60,
  coloredWords: [],
}

export const DEFAULT_CURSOR: CustomCursor = {
  enabled: false,
  type: 'pack',
  packId: 'hatsune-miku',
}

export const DEFAULT_EFFECTS: ProfileEffects = {
  enabled: false,
  effect: 'none',
  intensity: 'normal',
  color: '#fbbf24',
}

export const PRESET_FONTS = [
  { name: 'Inter', url: '/assets/fonts/Inter/Inter-VariableFont_opsz,wght.ttf', category: 'sans' },
  { name: 'Space Grotesk', url: '/assets/fonts/Space_Grotesk/SpaceGrotesk-VariableFont_wght.ttf', category: 'sans' },
  { name: 'Plus Jakarta Sans', url: '/assets/fonts/Plus_Jakarta_Sans/PlusJakartaSans-VariableFont_wght.ttf', category: 'sans' },
  { name: 'Outfit', url: '/assets/fonts/Outfit/Outfit-VariableFont_wght.ttf', category: 'sans' },
  { name: 'Sora', url: '/assets/fonts/Sora/Sora-VariableFont_wght.ttf', category: 'sans' },
  { name: 'Manrope', url: '/assets/fonts/Manrope/Manrope-VariableFont_wght.ttf', category: 'sans' },
  { name: 'DM Sans', url: '/assets/fonts/DM_Sans/DMSans-VariableFont_opsz,wght.ttf', category: 'sans' },
  { name: 'Orbitron', url: '/assets/fonts/Orbitron/Orbitron-VariableFont_wght.ttf', category: 'display' },
  { name: 'Chakra Petch', url: '/assets/fonts/Chakra_Petch/ChakraPetch-Regular.ttf', category: 'display' },
  { name: 'Audiowide', url: '/assets/fonts/Audiowide/Audiowide-Regular.ttf', category: 'display' },
  { name: 'Bebas Neue', url: '/assets/fonts/Bebas_Neue/BebasNeue-Regular.ttf', category: 'display' },
  { name: 'Playfair Display', url: '/assets/fonts/Playfair_Display/PlayfairDisplay-VariableFont_wght.ttf', category: 'serif' },
  { name: 'Lora', url: '/assets/fonts/Lora/Lora-VariableFont_wght.ttf', category: 'serif' },
  { name: 'Caveat', url: '/assets/fonts/Caveat/Caveat-VariableFont_wght.ttf', category: 'handwriting' },
  { name: 'JetBrains Mono', url: '/assets/fonts/JetBrains_Mono/JetBrainsMono-VariableFont_wght.ttf', category: 'mono' },
  { name: 'Fira Code', url: '/assets/fonts/Fira_Code/FiraCode-VariableFont_wght.ttf', category: 'mono' },
] as const
